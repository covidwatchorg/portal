const tcn = require("tcn-node");

function enumMemoTypeOf(memoType: number): string {
    var res: string;
    switch(memoType) { 
        case 0: { 
           res = 'CoEpiV1'; 
           break; 
        } 
        case 1: { 
           res = 'CovidWatchV1'; 
           break; 
        } 
        default: { 
           res = 'Reserved'; 
           break; 
        } 
     };
     return res;
}

function verifySignature(bTck: Buffer, bMemo: Buffer, bSig: Buffer,
    bRvk: Buffer, startIndex: number, endIndex: number, memoType: number): boolean {

    var report = {
        rvk: bRvk.toJSON().data,
        tck_bytes: bTck.toJSON().data,
        j_1: startIndex,
        j_2: endIndex,
        memo_type: enumMemoTypeOf(memoType),
        memo_data: bMemo.toJSON().data,
    }

    var sigBytes = bSig.toJSON().data;
    var sig = {
        R_bytes: sigBytes.slice(0, 32),
        s_bytes: sigBytes.slice(32, 64)
    }

    return tcn.validateReport(
        {
            report: report,
            sig: sig
        }
    )
}

function bla() {return "bla"}

export { verifySignature, bla}