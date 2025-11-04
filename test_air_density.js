// 공기 밀도 계산 함수
function calculateAirDensity(temp, pressure, humidity) {
  const T = temp + 273.15
  const p = pressure * 100
  const R_specific = 287.05
  const e_s = 611.2 * Math.exp(17.67 * temp / (temp + 243.5))
  const e = (humidity / 100) * e_s
  const rho = (p / (R_specific * T)) * (1 - 0.378 * e / p)
  return rho
}

console.log('=== 공기 밀도 수치 비교 ===\n')

// 표준 조건
const standard = calculateAirDensity(20, 1013.25, 50)
console.log(`표준 조건 (20°C, 1013.25 hPa, 50%): ${standard.toFixed(3)} kg/m³\n`)

// 고온 vs 저온
const cold = calculateAirDensity(0, 1013.25, 50)
const hot = calculateAirDensity(40, 1013.25, 50)
console.log(`고온 vs 저온:`)
console.log(`  저온 (0°C):  ${cold.toFixed(3)} kg/m³`)
console.log(`  고온 (40°C): ${hot.toFixed(3)} kg/m³`)
console.log(`  차이: ${(cold - hot).toFixed(3)} kg/m³ (${((cold - hot) / cold * 100).toFixed(1)}% 감소)\n`)

// 고압 vs 저압
const lowP = calculateAirDensity(20, 900, 50)
const highP = calculateAirDensity(20, 1100, 50)
console.log(`고압 vs 저압:`)
console.log(`  저압 (900 hPa):  ${lowP.toFixed(3)} kg/m³`)
console.log(`  고압 (1100 hPa): ${highP.toFixed(3)} kg/m³`)
console.log(`  차이: ${(highP - lowP).toFixed(3)} kg/m³ (${((highP - lowP) / lowP * 100).toFixed(1)}% 증가)\n`)

// 고습 vs 저습
const lowH = calculateAirDensity(20, 1013.25, 10)
const highH = calculateAirDensity(20, 1013.25, 90)
console.log(`고습 vs 저습:`)
console.log(`  저습 (10%): ${lowH.toFixed(3)} kg/m³`)
console.log(`  고습 (90%): ${highH.toFixed(3)} kg/m³`)
console.log(`  차이: ${(lowH - highH).toFixed(3)} kg/m³ (${((lowH - highH) / lowH * 100).toFixed(1)}% 감소)`)
