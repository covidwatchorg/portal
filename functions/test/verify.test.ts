import { expect } from 'chai';
import 'mocha';

import {bla} from "../src/verify"


@suite
export class CryptoVerification {

  @test
   "bla is bla"() {
    const result = bla();
    expect(result).to.equal('bla');

  }

}

// describe('Test for crypto verification', () => {

//     it('should return hello world', () => {
//       const result = bla();
//       console.log('asdadsa')
//       expect(result).to.equal('Hello bla!');
//     });
  
//   });