import express from 'express';
import fs from "fs"; //PErmite trabajar con File System
import bodyParser from "body-parser"; //Iterpretando  los datos y valores que se le da a application/json al agregar un user.

const app = express();

//middleware
app.use(bodyParser.json());

//Funcion para conectar a DB para que lea Datos
const readData = ()=>{
    try{ //para que intente hacer eso 
        const data = fs.readFileSync("./db.json"); //Espera que lea los datos para continuar con la ejecucion del programa 
        return JSON.parse(data);
    }catch (error) {//si encuentra algun error me imprima en consola el error 
        console.log(error);
    }
    //console.log(JSON.parse(data)); PAra checar que si nos trajo los datos
};

//Creando funcion para Escribir los datos 
const writeData = (data) => {
    try{ //para que intente hacer eso 
        fs.writeFileSync("./db.json", JSON.stringify(data));
    }catch (error) {//si encuentra algun error me imprima en consola el error 
        console.log(error);
    }
};

app.get('/', (req, res)=> {
    res.send("SERVIDOR GET, POST, PUT, DELETE .... Users")
});


//ENDPOINT con funcion calback que recibe parametros de la peticion y respuesta 
app.get("/users", (req, res)=> {
    const data = readData();
    res.json(data.users) //en este caso se remplaza el send por json para  que me de la respuesta con formato JSON  llamando a users la propiedad que esta dentro de la DATA
});

//ENDPOINT para obtener user por ID con parametro
app.get("/users/:id", (req, res)=> {
    const data = readData();//Funcion de leer users
    const id = parseInt(req.params.id);//para extraer el id del objeto de la peticion

    if (data === 0) { 
        res.json({message: `El Usuario con Id ${id} no existe` });
    }

    const user = data.users.find((user) => user.id === id);

    res.json(user);
});

//ENDPOINT POST  AGREGAR
app.post("/users", (req, res) => {
    const data = readData();//Leer los datos 
    const body = req.body;//Extraer el body que va a estar en objeto de la peticion en el body se envian los datos de user creado

    console.log(Object.keys(body).length)

    if (Object.keys(body).length  < 1){
        return res.json({message: "No se encuentran datos."})
    }
    
    const newUser = {
        id: data.users.length + 1,
        ...body,
    }; //objeto  en el que el id se genera automaticamente, y con ...body va a agregar todo lo que esta en body lo va a agregar a ese nuevo objeto.

    //Agregando el Nuevo usuario a los usuarios que se tenenian en DB
    data.users.push(newUser);

    writeData(data);//lee los fs existenntes con el nuevo agregado  

    res.json(newUser);
});

//ENPOINT PUT ACTUALIZAR 
app.put("/users/:id", (req, res)=>{
    const data = readData();//Leer los datos user 
    const body = req.body; // con lo que se va a actualizar
    const id = parseInt(req.params.id);//leer el id de l user 
    const userIndex =data.users.findIndex((user) => user.id === id) //Buscar el index en donde se compla la condicion de user en los parametros url

    if (userIndex  === -1) { //Cuando no lo encuentra en -1
        res.json({message: `El Usuario con Id ${id} no existe` });
    }

    data.users[userIndex]= {
        ...data.users[userIndex],//Actualizar todos los datos de el usuario 
        ...body, //con estos que entran de body 
    };
    writeData(data); //Para Escribir los nuevos datos en BD

    res.json({message: "El usuario fue actualisado correctamente"});
    // res.json(data.users[userIndex]);
});

//ENDPOINT DELETE
app.delete("/users/:id", (req, res) => {
    const data = readData();//Leer los datos user 
    const id = parseInt(req.params.id);//leer el id de l user
    const userIndex = data.users.findIndex((user) => user.id === id);   

    if (userIndex  === -1) { //Cuando no lo encuentra en -1
        res.json({message: `El Usuario con Id ${id} no existe` });
    }

    data.users.splice(userIndex, 2); //Borrar y colocar cuantos se quiere borrar apartir de el index
    writeData(data); //Editamos BD

    res.json({message: "El Usuario se elimino correctamente"});

});

app.listen(3000, () =>{
    console.log ('servidor listening on port 3000');
});