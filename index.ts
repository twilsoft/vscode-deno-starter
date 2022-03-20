import { z } from "zod";

const MessageSchema = z.object({
  message: z.string(),
});

const printMessage = (message: z.infer<typeof MessageSchema>) => {
  const validatedMessage = MessageSchema.parse(message);
  console.log(validatedMessage.message);
  return validatedMessage.message;
};

export { printMessage };
