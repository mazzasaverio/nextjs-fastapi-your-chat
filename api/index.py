from fastapi import FastAPI, HTTPException
from typing import List, Dict, Any
from langchain_core.messages import AIMessage, HumanMessage
from langchain_community.document_loaders import WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from pydantic import BaseModel

from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
load_dotenv()

# Global variables for chat history and vector store
chat_history = [AIMessage(content="Hello, I am a bot. How can I help you?")]
vector_store = None


class UrlModel(BaseModel):
    url: str


@app.post("/api/scrape")
async def get_vectorstore_from_url(item: UrlModel):
    url = item.url
    global vector_store
    logger.info(f"Received request to scrape URL: {url}")

    try:
        # Log the received URL for debugging
        logger.info(f"Received URL: {url}")

        loader = WebBaseLoader(url)
        document = loader.load()
        text_splitter = RecursiveCharacterTextSplitter()
        document_chunks = text_splitter.split_documents(document)
        vector_store = Chroma.from_documents(document_chunks, OpenAIEmbeddings())
        logger.info(f"Vector store initialized")
        return {"message": "Vector store initialized"}
    except Exception as e:
        logger.error(f"Error in get_vectorstore_from_url: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class ChatRequest(BaseModel):
    message: str


@app.post("/api/chat")
async def chat(request: ChatRequest):
    global chat_history, vector_store
    if vector_store is None:
        raise HTTPException(status_code=404, detail="Vector store not found")

    try:
        user_message = HumanMessage(content=request.message)

        retriever_chain = get_context_retriever_chain(vector_store)
        conversation_rag_chain = get_conversational_rag_chain(retriever_chain)

        logger.info(f"User message: {user_message.content}")
        logger.info(f"Chat history: {chat_history}")
        response = conversation_rag_chain.invoke(
            {"chat_history": chat_history, "input": user_message}
        )

        chat_history.append(user_message)

        ai_message = AIMessage(content=response["answer"])
        chat_history.append(ai_message)

        return response["answer"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def get_context_retriever_chain(vector_store):
    logger.info("Creating context retriever chain")
    llm = ChatOpenAI()

    retriever = vector_store.as_retriever()

    prompt = ChatPromptTemplate.from_messages(
        [
            MessagesPlaceholder(variable_name="chat_history"),
            ("user", "{input}"),
            (
                "user",
                "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation",
            ),
        ]
    )

    retriever_chain = create_history_aware_retriever(llm, retriever, prompt)

    return retriever_chain


def get_conversational_rag_chain(retriever_chain):

    llm = ChatOpenAI()

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "Answer the user's questions based on the below context:\n\n{context}",
            ),
            MessagesPlaceholder(variable_name="chat_history"),
            ("user", "{input}"),
        ]
    )

    stuff_documents_chain = create_stuff_documents_chain(llm, prompt)

    return create_retrieval_chain(retriever_chain, stuff_documents_chain)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
