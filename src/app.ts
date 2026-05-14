import Fastify from "fastify";
export const app = Fastify();

const message = "VAI CORINTHIANS!!";

app.get("/", async function handler(request, reply) {
  return message;
});

app.get("/status", async () => {
    return {
        
    }  
})