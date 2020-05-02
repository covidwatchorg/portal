import { suite } from "mocha-typescript";
import * as Postman from "../src/types/Postman"
import * as SignedReport from "../src/types/SignedReport"
const fs = require("fs")
const chai = require('chai'), chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

let postman: Postman.Welcome;
let testNames = {
    newSignedReport : "v1 TCN POST New Signed Report"
}

function getConfig(json: Postman.Welcome, testName: string) {
    const item : Postman.Item  = json.item.filter((p: Postman.Item)=> p.name === testName)[0];
    let body: string = "";
    if (item.request.body){
        body = item.request.body.raw;
    }
    return {url: item.request.url.raw, body: body};
}

before(async () => {
    postman = JSON.parse(fs.readFileSync("../COVID-Watch.postman_collection.json"));
})

@suite
export class IntegratedTest {

  @test
  async "Submit new signed report should succeed"() {
    const config = getConfig(postman, testNames.newSignedReport);
    await chai
    .request(config.url)
    .post("")
    .send(JSON.parse(config.body))
    .then(function (res: Response) {
      expect(res).to.have.status(201);
      expect(res.text).to.deep.equal('{"status":"201","message":"Success"}')
    })
  }

  @test
  async "Submit new malsigned report should fail"() {
    const config = getConfig(postman, testNames.newSignedReport);
    const tamperedBody: SignedReport.Welcome= JSON.parse(config.body);
    tamperedBody.signature_bytes =  "tampered";
    await chai
    .request(config.url)
    .post("")
    .send(tamperedBody)
    .then(function (res: Response) {
      expect(res).to.have.status(400);
    })
  }

}



