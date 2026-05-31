import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "buildordie",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
