import { suite } from "mocha-typescript";

const chai = require('chai')
  , chaiHttp = require('chai-http');
const expect = chai.expect;

chai.use(chaiHttp);

@suite
export class Integrated {

  @test
  async "Basic test"() {
    await chai
    .request("http://localhost:5001")
    .post("/covidwatch-354ce/us-central1/submitReport")
    .send(
      {
        temporary_contact_key_bytes: "PvLGpfQZgGqnoQRtSr0AHd8J5/WdKwaJNLRCkhGlgHU=",
        memo_data: "SGVsbG8sIFdvcmxkIQ==",
        memo_type: 1,
        start_index: 1,
        end_index: 8,
        signature_bytes: "+k7HDsVZPY5Pxcz0cpwVBvDOHrrQ0+AyDVL/MbGkXBYG2WAyoqLaNxFuXiB9rSzkdCesDv1NSSk06hrjx2YABA==",
        report_verification_public_key_bytes: "v78liBBYQrFXqOH6YydUD1aGpXLMgruKATAjFZ0ycLk="
      }
    )
    .then(function (res: Response) {
      expect(res).to.have.status(201);
      expect(res.text).to.to.deep.equal('{"status":"201","message":"Success"}')
    })
  }

}