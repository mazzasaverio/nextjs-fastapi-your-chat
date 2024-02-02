import { MessageSquare } from "lucide-react";

export const Loader = () => {
  return (
    <div className="h-full flex flex-col gap-y-4 items-center justify-center">
      <div className="w-10 h-10 relative animate-spin">
        <MessageSquare className="w-full h-full" />
      </div>
      <p className="text-sm text-muted-foreground">I am thinking...</p>
    </div>
  );
};
