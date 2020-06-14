//não adicioanr os parênteses aqui, deixar o app.js determinar qnd vai executar a função?!


module.exports.getDate = () => {

    let date = new Date();
    let options = {
        dateStyle: "full",
        weekday: "long"
    };

    return date.toLocaleDateString('en-US', options);
}

module.exports.getDay = () => {

    let date = new Date();
    let options = {
        weekday: "long"
    };
    
    return date.toLocaleDateString('en-US', options);
}