import {
  getExamples,
  getMessageFromError,
  getStatusCodeFromError,
  ResultHandler
} from "express-zod-api";
import { z } from "zod";
import range from "lodash.range";

const resultHandler = new ResultHandler({
  positive: output => {
    // Examples are taken for proxying: no validation needed for this
    const examples = getExamples({ schema: output });
    const responseSchema = output;
    return examples.reduce<typeof responseSchema>(
      (acc, example) => acc.example(example as never),
      responseSchema
    );
  },
  negative: [
    {
      statusCodes: [400, ...range(401, 499)],
      schema: z.string()
    },
    {
      statusCodes: [500],
      schema: z.object({})
    }
  ],
  handler: ({ error, input, output, request, response, logger }) => {
    if (!error) {
      response.status(200).json(output);
      return;
    }
    const statusCode = getStatusCodeFromError(error);
    if (statusCode === 500) {
      logger.error(`Internal server error\n${error.stack}\n`, {
        url: request.url,
        payload: input
      });
      response.status(statusCode).send();
      return;
    }
    response.status(statusCode).send(getMessageFromError(error));
  }
});
export default resultHandler;
