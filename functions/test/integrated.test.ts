import { suite, test } from "mocha-typescript";
import * as Postman from "../src/types/postman"
import * as SignedReport from "../src/types/signedReportRequest"
import * as ServerResponse from "../src/types/serverResponse"
import * as DiagnosisRequest from "../src/types/diagnosisRequest"
const fs = require("fs")
const chai = require('chai'), chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

let postman: Postman.Root;
const testNames = {
    allSignedReports: "v1 TCN GET ALL Signed Reports",
    newSignedReport : "v1 TCN POST New Signed Report",
    liveAllSignedReports: "v1 LIVE GET ALL Signed Reports",
    allDiagnosis: "v2 AG GET ALL Diagnosis",
    newPermissionNumber: "v2 SECURE GET Generate Permission Number",
    newDiagnosis: "v2 AG POST New Diagnosis"

}

function getConfig(json: Postman.Root, testName: string) {
    const item : Postman.Item  = json.item.filter((p: Postman.Item)=> p.name === testName)[0];
    let body: string = "";
    if (item.request.body){
        body = item.request.body.raw;
    }
    return {url: item.request.url.raw, body: body};
}

function chaiPost(url: string, body: string): Promise<Response> {
    return chai
    .request(url)
    .post("")
    .send(JSON.parse(body))
}

function chaiGet(url: string): Promise<Response> {
    return chai
    .request(url)
    .get("")
}

before(async () => {
    postman = JSON.parse(fs.readFileSync("../COVID-Watch.postman_collection.json"));
})

@suite
export class IntegratedTest {

  @test
  async "Submit new signed report should succeed"() {
    const config = getConfig(postman, testNames.newSignedReport);
    await chaiPost(config.url, config.body)
    .then(function (res: Response) {
      expect(res).to.have.status(201);
      expect(res.text).to.deep.equal('{"status":"201","message":"Success"}')
    })
  }

  @test
  async "Submit new malsigned report should fail"() {
    const config = getConfig(postman, testNames.newSignedReport);
    const tamperedBody: SignedReport.Root= JSON.parse(config.body);
    tamperedBody.signature_bytes =  "tampered";
    await chaiPost(config.url, JSON.stringify(tamperedBody))
    .then(function (res: Response) {
        expect(res).to.have.status(400);
    })
  }


  @test 
  async "Get all signed reports should succeed"() {
    const config = getConfig(postman, testNames.allSignedReports);
    await chaiGet(config.url)
    .then(function (res: Response) {
        expect(res).to.have.status(200);
    })
  }

  @test 
  async "Get all live signed reports should succeed"() {
    const config = getConfig(postman, testNames.liveAllSignedReports);
    await chaiGet(config.url)
    .then(function (res: Response) {
        expect(res).to.have.status(200);
    })
  }

  @test 
  async "Get all diagnosis should succeed"() {
    const config = getConfig(postman, testNames.allDiagnosis);
    await chaiGet(config.url)
    .then(function (res: Response) {
        expect(res).to.have.status(201);
    })
  }

  @test
  async "Generate health authority number and post new diagnosis with that number should succeed"(){
    const config1 = getConfig(postman, testNames.newPermissionNumber);
    const r1 = await chaiGet(config1.url)
    .then(function (res: Response) {
        expect(res).to.have.status(201);
        return res.text
    });
    const res1Json: ServerResponse.Root = JSON.parse(r1.toString());
    const newNumber = res1Json.data[0];

    const config2 = getConfig(postman, testNames.newDiagnosis);
    const diagRequest: DiagnosisRequest.Root = JSON.parse(config2.body);
    diagRequest.public_health_authority_permission_number = newNumber;
    await chaiPost(config2.url, JSON.stringify(diagRequest))
    .then(function (res: Response) {
        expect(res).to.have.status(201);
        expect(res.text).to.deep.equal('{"status":"201","message":"Success"}')
    });
  }

  @test
  async "Post new diagnosis with invalid number should fail"(){
    const config2 = getConfig(postman, testNames.newDiagnosis);
    const diagRequest: DiagnosisRequest.Root = JSON.parse(config2.body);
    diagRequest.public_health_authority_permission_number = "inval";
    await chaiPost(config2.url, JSON.stringify(diagRequest))
    .then(function (res: Response) {
        expect(res).to.have.status(400);
    });
  }



}



