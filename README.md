This is a hybrid Next.js + Python app that uses Next.js as the frontend and FastAPI as the API backend. One great use case of this is to write Next.js apps that use Python AI libraries on the backend.

Features

- Website Interaction: The chatbot uses the latest version of LangChain to interact with and extract information from various websites.
- Large Language Model Integration: Compatibility with models like GPT-4, Mistral, Llama2, and ollama. In this code I am using GPT-4, but you can change it to any other model.
- Nextjs frontend: A clean and intuitive user interface built with Streamlit, making it accessible for users with varying levels of technical expertise.

## How It Works

The Python/FastAPI server is mapped into to Next.js app under `/api/`.

This is implemented using [`next.config.js` rewrites](https://github.com/digitros/nextjs-fastapi/blob/main/next.config.js) to map any request to `/api/:path*` to the FastAPI API, which is hosted in the `/api` folder.

On localhost, the rewrite will be made to the `127.0.0.1:8000` port, which is where the FastAPI server is running.

In production, the FastAPI server is hosted as [Python serverless functions](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/python) on Vercel.

## Getting Started

```bash
npm install
```

Create your own .env file with the following variables:

OPENAI_API_KEY=[your-openai-api-key]

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The FastApi server will be running on [http://127.0.0.1:8000](http://127.0.0.1:8000) – feel free to change the port in `package.json` (you'll also need to update it in `next.config.js`).

## Se si vuole testare solo il backend in locale

conda create --name nextjs-fastapi-your-chat python=3.10

conda activate nextjs-fastapi-your-chat

pip install -r requiremtns.txt

uvicorn api.index:app --reload

---

To maintain the chat history across multiple requests until the backend is shut down, you have a few options:

Global Variable: You can store the chat history in a global variable. This is the simplest method but is generally not recommended for production systems due to potential issues with scalability and data consistency, especially in asynchronous environments or when scaling to multiple workers.

In-Memory Database or Cache: Use an in-memory database like Redis, or an in-memory cache to store the chat history. This is more scalable and can be shared across multiple instances of your application.

Database Storage: Store the chat history in a database. This is the most robust method, allowing for persistence even if the backend restarts, and can be used across multiple instances of your application.

Note: While using global variables can be suitable for simple applications or prototypes, it's not ideal for production environments due to the reasons mentioned earlier. For a production system, consider using a more robust solution like a database or an in-memory store.

Explanation of RAG Algorithms
27:51
is actually happening behind the scenes in a rag applic
27:58
okay um what is rag rag means retrieval augmented
28:03
generation uh in other words it means that we're going to augment the knowledge of our language model with
28:11
context that we're going to retrieve from a custom knowledge base okay um I
28:20
have a diagram that I had made for a previous video if want to check that out
28:25
this one comes from the video of chat with your PDFs but the idea is
28:31
pretty much the same thing for chatting with your website okay what you're going to want to do well I mean what we're
28:38
going to do in our application is we're going to take our HTML documents which are going to be fetched
28:45
by adding the website URL right here and from them we're going to use
28:50
Lang Ching to extract the text okay however the text might be huge I mean in
28:56
our case it was a it was a short blog post but it can also be like a huge Wikipedia post or something like that
29:03
and the problem is that you cannot feed a huge Wikipedia post to most language
29:09
models um most of them have a context window that only allows you to send like
29:17
uh limited number of tokens and if you send like the entire context the like
29:23
all of your knowledge base you're probably going to go beyond that context window so what you want to
29:30
do is you're going to take all of the text from your website and you're going to split it into different chunks of
29:37
text so in our case for example um the blog post for Lang Lang graph um the
29:46
first chunk is going to be probably the introduction the second chunk is going to be the first paragraph and Etc until
29:52
the conclusion okay and this chunks of text then we're going to pass pass them
29:58
through a an embeddings model OKAY in our case we're going to use an embedding
30:04
models an embeddings model that also comes from open AI but there are other
30:10
embeddings models that you can use um for example you can use them the ones that are available in hog in Phase okay
30:19
now what does the embeddings model do what the embedding models uh do is they
30:26
take your text in our case we're taking each chunk of text and they're going to
30:31
vectorize it or in other words they're going to create a numerical representation of your chunk of text now
30:38
why do you want your text to be in a numerical representation the answer for that is
30:44
that with all of those numerical representations we're going to be creating a vector store and the use of
30:50
this Vector store is that we're going to be able to find the chunks of text that
30:56
are relevant to what the user asked in their query so for example if they're
31:02
asking about Lang graph or what is a neural network or whatever we're going to embed their question using the same
31:10
model that we used to to embed our chunks of text and we're going to perform a
31:16
semantic search and the computer can only find uh can only perform a semantic
31:21
search with vectorized data it cannot do that with simple words because computers
31:27
do not understand words they understand numbers so in our case we're going to um
31:33
have our vectorized chunks of text we're going to vectorize our user question and
31:38
that is going to allow us to find the chunks of text that are relevant or
31:43
similar to whatever the user asked so if the user asks a question about um for
31:50
example what iside neural network the vector store is going to
31:55
find which chunks of text are relevant to answer to that question it's going to
32:01
return some chunks of text and from some and we're going to take those chunks of
32:06
text to send them to our llm as context so the final message to our language
32:13
model is going to look something like based on the following context and then we're going to paste whatever we found
32:20
here answer the following question and we're going to send in the question from the user and in our case we're also
32:26
going to pass in the history so our full prompt to our language
32:32
model is going to look something like based on the following context and
32:38
then we're going to add the retrieved chunk of text that we found from our
32:44
HTML page answer complete the following
32:49
conversation and then we're going to send the entire chat history of our conversation and then the user query so
32:56
that it knows knows the history of the conversation and it also knows the context to answer our our question with
33:04
okay so that's basically how rag uh chat BS work and uh I'm going to add this

Ora:

def get_vectorstore_from_url(url): # get the text in document form
loader = WebBaseLoader(url)
document = loader.load()

    # split the document into chunks
    text_splitter = RecursiveCharacterTextSplitter()
    document_chunks = text_splitter.split_documents(document)

    # create a vectorstore from the chunks
    vector_store = Chroma.from_documents(document_chunks, OpenAIEmbeddings())

    return vector_store

this is that each document not only contains the content of the document
41:05
itself but it also contains metadata all right and this includes the source of
41:11
the document and the title and the language as well so this is important if you have like
41:17
several several um data sources in this case we're only we're only talking to
41:24
one to one um data source which is this blog post
41:31
but if we had another if we had like if we were talking to several websites or
41:36
something like that at the same time this would be useful to know from where
41:41
our our chatbot is retrieving the information okay so there you go that's
41:47
how we split the text Doc the text into different

that we have finished this part right here which means that we have extracted the text from our HTML files we have
48:51
divided it have split it into different chunks of text um which are in the form of a document
48:58
we have used open AI embeddings in order to vectorize them and create a vector store with uh chroma

we are going to create a retriever chain the retriever chain is basically a chain
that is going to take the user query

we are going to be getting the the text the chunks of text that are relevant not only to the latest question from the user but also to the entire conversation so we're going to be embedding the entire conversation history and we're going to be using it to get the chunks

def get_context_retriever_chain(vector_store):
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

I'm
50:06
going to organize this in sort of a pipeline way so we're going to uh create
50:12
a function that gets the retriever
50:19
chain um I'm going to call it get context retriever chain because it's going to
it's a contextual retrial chain and this one is going to take in the vector store

MessagesPlaceholder(variable_name="chat_history")

we're going to pass in and the messages placeholder just replaces all of this
53:37
with the value of the chat history variable if that variable exist otherwise it's going to leave it empty
53:44
okay this is important because if at the beginning of the conversation we do not have a chat history this is going to

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

interesting right here is that right here we're going to pass in a human message we could I think that
54:14
technically we could use human message uh schema however Lang chain also allows
54:19
you to send in messages as a topple the first element of the topple
54:25
is going to be the kind of um the type
54:30
of message that this is in this case it is the user and remember that in prompts
54:35
at least in lunching they work pretty much the same as F strings in Python
54:41
which means that you're going to add here your variables and then when you populate the prompt this variable right
54:48
here

Keep in mind that chat_history and input are going to be populated
55:06
with whatever I pass in in the chain

## Inspiration and References

[chat-with-websites](https://github.com/alejandro-ao/chat-with-websites)

Happy Coding! 🚀👨‍💻🤖

Don't forget to star this repo if you find it useful!
