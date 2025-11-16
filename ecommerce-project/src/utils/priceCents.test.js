import {it, expect, describe} from 'vitest';
import priceCents from './priceCents';

describe('formateMoney',()=>{
  it('formats 1999 cents as $19.99', ()=>{
  expect(priceCents(1999)).toBe('$19.99');
});

it('formats 1090 cents as $10.90', ()=>{
  expect(priceCents(1090)).toBe('$10.90');
  expect(priceCents(100)).toBe('$1.00');
});
});
