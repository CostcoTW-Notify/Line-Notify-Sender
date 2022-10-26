import { Application, Request } from "express";
import { body, param } from "express-validator";
import { ensureRequestIsValid } from "@/utils/validate";
import { SampleRequest, SampleResponse } from "@/models/sampleModel";

export class SampleController {
  public static registerRouter(app: Application) {
    /**
     * GET /Sample/{someId}
     * @summary Get Sample
     * @tag Sample
     * @param {number} someId.path
     * @return {SampleResponse} 200 - success response
     */
    app.get(
      "/Sample/:someId",
      param("someId").isNumeric(),
      async (req: Request, res) => {
        ensureRequestIsValid(req);
        const controller = new SampleController();
        let result = await controller.getSomthing(+req.params.someId);
        res.json(result);
      }
    );

    /**
     * POST /Sample
     * @summary Post to Sample
     * @tag Sample
     * @param {SampleRequest} request.body.required
     * @return {SampleResponse} 200 - success
     */
    app.post(
      "/Sample",
      body("paramStr").isString(),
      body("paramNum").isNumeric(),
      async (req: Request, res) => {
        ensureRequestIsValid(req);
        const controller = new SampleController();
        let result = await controller.postSomething({
          paramStr: req.body.paramStr,
          paramNum: req.body.paramNum,
        });

        return res.json(result);
      }
    );
  }

  public async getSomthing(someId: number): Promise<SampleResponse> {
    return {
      status: 200,
      message: `input is ${someId}`,
    };
  }

  public async postSomething(body: SampleRequest): Promise<SampleResponse> {
    return {
      status: 200,
      message: `param1 : ${body.paramStr} , param2 : ${body.paramNum}`,
    };
  }
}
