const tcn = require("tcn-node")

function enumMemoTypeOf(memoType: number): string | null {
  let res: string | null;
  if(memoType < 0x0 || memoType > 0xff){
    res = null;
  }
  else {
    switch (memoType) {
      case 0: {
        res = "CoEpiV1"
        break
      }
      case 1: {
        res = "CovidWatchV1"
        break
      }
      default: {
        res = "Reserved"
        break
      }
    }
  }
  return res
}

function verifyMemoType(memoType: number): boolean {
  return enumMemoTypeOf(memoType) !== null
}

function verifySignature(
  bTck: Buffer,
  bMemo: Buffer,
  bSig: Buffer,
  bRvk: Buffer,
  startIndex: number,
  endIndex: number,
  memoType: number
): boolean {
  const report = {
    rvk: bRvk.toJSON().data,
    tck_bytes: bTck.toJSON().data,
    j_1: startIndex,
    j_2: endIndex,
    memo_type: enumMemoTypeOf(memoType),
    memo_data: bMemo.toJSON().data,
  }

  const sigBytes = bSig.toJSON().data
  const sig = {
    R_bytes: sigBytes.slice(0, 32),
    s_bytes: sigBytes.slice(32, 64),
  }

  return tcn.validateReport({
    report: report,
    sig: sig,
  })
}

export { verifySignature, verifyMemoType }
