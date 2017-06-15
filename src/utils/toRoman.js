// http://eddmann.com/posts/arabic-to-roman-numerals-converter-in-javascript/
export default function toRoman(decimal) {
  const chart = [
    [ 'M', 1000],
    ['CM',  900],
    [ 'D',  500],
    ['CD',  400],
    [ 'C',  100],
    ['XC',   90],
    [ 'L',   50],
    ['XL',   40],
    [ 'X',   10],
    ['IX',    9],
    [ 'V',    5],
    ['IV',    4],
    [ 'I',    1]
  ];
  function recur(remainder, chart) {
    if (remainder === 0) return '';
    const [[numeral, value], ...tail] = chart;
    return numeral.repeat(remainder / value) + recur(remainder % value, tail);
  };
  return recur(decimal, chart);
}