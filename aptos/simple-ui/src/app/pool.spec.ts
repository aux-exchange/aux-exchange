import { parseMoveStructType } from './pool';

fdescribe('parseMoveType', function () {
  beforeAll(function () {
    spyOn(console, 'dir').and.callThrough();
  });

  it('parse-correct', function () {
    let a = parseMoveStructType('0x01::aptos::AptosCoin');
    expect(a !== undefined).toBeTrue;
    console.dir(a);
  });
});
