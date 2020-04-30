import { expect } from "chai"
import "mocha"
import { verifySignature } from "../src/verify"

const valid = {
  tck: Buffer.from("PvLGpfQZgGqnoQRtSr0AHd8J5/WdKwaJNLRCkhGlgHU=", "base64"),
  memo: Buffer.from("SGVsbG8sIFdvcmxkIQ==", "base64"),
  memoType: 1,
  startIndex: 1,
  endIndex: 8,
  sig: Buffer.from(
    "+k7HDsVZPY5Pxcz0cpwVBvDOHrrQ0+AyDVL/MbGkXBYG2WAyoqLaNxFuXiB9rSzkdCesDv1NSSk06hrjx2YABA==",
    "base64"
  ),
  rvk: Buffer.from("v78liBBYQrFXqOH6YydUD1aGpXLMgruKATAjFZ0ycLk=", "base64"),
}

@suite
export class CryptoVerification {
  @test
  "It should pass for untampered message and signature"() {
    var data = { ...valid }
    var result = verifySignature(
      data.tck,
      data.memo,
      data.sig,
      data.rvk,
      data.startIndex,
      data.endIndex,
      data.memoType
    )
    expect(result).to.be.true
  }

  @test
  "It should not pass for tampered message or signature"() {
    var data = { ...valid }
    data.memoType = 2
    var result = verifySignature(
      data.tck,
      data.memo,
      data.sig,
      data.rvk,
      data.startIndex,
      data.endIndex,
      data.memoType
    )
    expect(result).to.be.false
  }
}
