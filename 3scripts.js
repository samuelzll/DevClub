function generateNumber(){

    const min = Math.ceil(document.querySelector('.input-min').value);
    const max = Math.floor(document.querySelector('.input-max').value);
    const resultInput = document.querySelector('.input-result');

    if (max > min){
        const result = Math.floor(Math.random() * (max - min + 1)) + min;

        resultInput.value = result;
    } else {
    alert('O valor mínimo deve ser MENOR que o máximo!')
    }
}