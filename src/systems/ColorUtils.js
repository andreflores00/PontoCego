// =====================================================
// ColorUtils.js — conversão de cor e distância ΔE
// =====================================================
// A distância entre duas cores é calculada no espaço CIE Lab,
// que é aproximadamente uniforme para a perceção humana:
// a mesma distância numérica corresponde a uma diferença
// visual parecida, ao contrário do espaço RGB.

// sRGB (0-255) -> componente linear (remove a correção gama)
function linearizar(c) {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

// Função auxiliar da conversão XYZ -> Lab
function f(t) {
    return t > 0.008856 ? Math.cbrt(t) : (7.787 * t) + 16 / 116;
}

// Converte {r,g,b} (0-255) para {L,a,b} (iluminante D65)
export function rgbParaLab(r, g, b) {
    const R = linearizar(r), G = linearizar(g), B = linearizar(b);

    // sRGB linear -> XYZ
    const X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
    const Y = (R * 0.2126 + G * 0.7152 + B * 0.0722) / 1.00000;
    const Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;

    // XYZ -> Lab
    const fx = f(X), fy = f(Y), fz = f(Z);
    return {
        L: 116 * fy - 16,
        a: 500 * (fx - fy),
        b: 200 * (fy - fz)
    };
}

// Distância de cor ΔE (fórmula CIE76): distância euclidiana em Lab.
// Valores de referência: < 2 quase impercetível, > 10 claramente diferente.
export function deltaE(lab1, lab2) {
    const dL = lab1.L - lab2.L;
    const da = lab1.a - lab2.a;
    const db = lab1.b - lab2.b;
    return Math.sqrt(dL * dL + da * da + db * db);
}
