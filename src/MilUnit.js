export default class MilUnit {
  name = 'Unnamed Unit';
  sidc = [
    ['version', '10'],
    ['context', '0'],
    ['affiliation', '3'],
    ['set', '10'],
    ['status', '0'],
    ['mod', '0'],
    ['amplifier', '00'],
    ['entity', '00'],
    ['type', '00'],
    ['subtype', '00'],
    ['modifier1', '00'],
    ['modifier2', '00'],
  ];
  
  constructor() {
  }
  
  getSidcCode() {
    return this.sidc.map((v, k) => v).join('');
  }
}
