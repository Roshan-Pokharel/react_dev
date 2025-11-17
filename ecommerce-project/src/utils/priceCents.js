function PriceCents(cents)
{
  return `Rs ${((cents)/100).toFixed(2)}`;
}
export default PriceCents;