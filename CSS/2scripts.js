const convertButton = document.querySelector(".convert-button")
const currencySelectTo = document.querySelector(".currency-select")
const currencySelectFrom = document.querySelectorAll("select")[0] // primeiro <select> (converter de)

function convertValues() {
    const inputCurrencyValue = document.querySelector(".input-currency").value
    const currencyValueToConvert = document.querySelector(".currency-value-to-convert")
    const currencyValueConverted = document.querySelector(".currency-value")

    const dolarToday = 5.40
    const euroToday = 6.26
    const bitcoinToday = 598.818

    let convertedValue = 0
    let from = currencySelectFrom.value
    let to = currencySelectTo.value

    // --- Cálculos de conversão ---
    if (from.includes("Real")) {
        if (to === "dolar") convertedValue = inputCurrencyValue / dolarToday
        if (to === "euro") convertedValue = inputCurrencyValue / euroToday
        if (to === "bitcoin") convertedValue = inputCurrencyValue / bitcoinToday
        if (to === "real") convertedValue = inputCurrencyValue
    }

    if (from.includes("Dólar")) {
        if (to === "real") convertedValue = inputCurrencyValue * dolarToday
        if (to === "euro") convertedValue = (inputCurrencyValue * dolarToday) / euroToday
        if (to === "bitcoin") convertedValue = (inputCurrencyValue * dolarToday) / bitcoinToday
        if (to === "dolar") convertedValue = inputCurrencyValue
    }

    if (from.includes("Euro")) {
        if (to === "real") convertedValue = inputCurrencyValue * euroToday
        if (to === "dolar") convertedValue = (inputCurrencyValue * euroToday) / dolarToday
        if (to === "bitcoin") convertedValue = (inputCurrencyValue * euroToday) / bitcoinToday
        if (to === "euro") convertedValue = inputCurrencyValue
    }

    if (from.includes("Bitcoin")) {
        if (to === "real") convertedValue = inputCurrencyValue * bitcoinToday
        if (to === "dolar") convertedValue = (inputCurrencyValue * bitcoinToday) / dolarToday
        if (to === "euro") convertedValue = (inputCurrencyValue * bitcoinToday) / euroToday
        if (to === "bitcoin") convertedValue = inputCurrencyValue
    }

    // --- Exibição do valor original ---
    if (from.includes("Real")) {
        currencyValueToConvert.innerHTML = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(inputCurrencyValue)
    }
    if (from.includes("Dólar")) {
        currencyValueToConvert.innerHTML = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(inputCurrencyValue)
    }
    if (from.includes("Euro")) {
        currencyValueToConvert.innerHTML = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(inputCurrencyValue)
    }
    if (from.includes("Bitcoin")) {
        currencyValueToConvert.innerHTML = parseFloat(inputCurrencyValue).toFixed(8) + " BTC"
    }

    // --- Exibição do valor convertido ---
    if (to === "real") {
        currencyValueConverted.innerHTML = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(convertedValue)
    }
    if (to === "dolar") {
        currencyValueConverted.innerHTML = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(convertedValue)
    }
    if (to === "euro") {
        currencyValueConverted.innerHTML = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(convertedValue)
    }
    if (to === "bitcoin") {
        currencyValueConverted.innerHTML = convertedValue.toFixed(8) + " BTC"
    }
}

// --- Atualiza as imagens e nomes ---
function updateCurrencyImages() {
    const fromImage = document.querySelector("section .currency-box img")
    const fromName = document.querySelector("section .currency-box p.currency")
    const toImage = document.querySelector(".currency-img")
    const toName = document.getElementById("currency-name")

    // imagem e nome da moeda "de"
    if (currencySelectFrom.value.includes("Real")) {
        fromImage.src = "imgs/brasil 2.png"
        fromName.innerHTML = "Real"
    }
    if (currencySelectFrom.value.includes("Dólar")) {
        fromImage.src = "imgs/estados-unidos (1) 1.png"
        fromName.innerHTML = "Dólar"
    }
    if (currencySelectFrom.value.includes("Euro")) {
        fromImage.src = "imgs/logoEuro.png"
        fromName.innerHTML = "Euro"
    }
    if (currencySelectFrom.value.includes("Bitcoin")) {
        fromImage.src = "imgs/bitcoin.png"
        fromName.innerHTML = "Bitcoin"
    }

    // imagem e nome da moeda "para"
    if (currencySelectTo.value === "real") {
        toImage.src = "imgs/brasil 2.png"
        toName.innerHTML = "Real"
    }
    if (currencySelectTo.value === "dolar") {
        toImage.src = "imgs/estados-unidos (1) 1.png"
        toName.innerHTML = "Dólar"
    }
    if (currencySelectTo.value === "euro") {
        toImage.src = "imgs/logoEuro.png"
        toName.innerHTML = "Euro"
    }
    if (currencySelectTo.value === "bitcoin") {
        toImage.src = "imgs/bitcoin.png"
        toName.innerHTML = "Bitcoin"
    }

    convertValues()
}

currencySelectTo.addEventListener("change", updateCurrencyImages)
currencySelectFrom.addEventListener("change", updateCurrencyImages)
convertButton.addEventListener("click", convertValues)