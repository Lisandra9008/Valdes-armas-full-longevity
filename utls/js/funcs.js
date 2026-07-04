let imgActiva="05";
let listaImag=['05','06','10','21','22','39','41','42','47']

let ciencia_invest_art=[
  { 
    "nomb":"Cultivo de Olivo en la Florida, una alternativa para la adaptación al cambio climático",
    "autor": ['Enrique Orestes Santos. Investigador independiente.',
              'Reinaldo Hanoi Valdes Reinoso. Doctor en Ciencias Forestales.',
              'Bertha Rita Castillo EduaDoctora en Ciencias Forestales.'],
    "ruta":"utls/sc-inv/articulo-publicado-rap05124.pdf",
    "ico":"utls/sc-inv/paper-64.ico"
},{ 
  "nomb":"Propuesta de medidas para mitigar daños por encharcamiento en plantaciones de olivo en Olive Land Farms, Florida, EUA",
  "autor": ['Enrique Orestes Santos. Investigador independiente.',
            'Reinaldo Hanoi Valdes Reinoso. Doctor en Ciencias Forestales.',
            'Bertha Rita Castillo EduaDoctora en Ciencias Forestales.'],
  "ruta":"https://revista.itson.edu.mx/index.php/rlrn/article/view/339",
  "ico":"utls/sc-inv/paper-64.ico"
}
]
let ciencia_invest_proy=[
  { 
    "nomb":"Proyecto Gestión sostenible de la granja “Olive Land Farms” para la mitigación de los efectos del cambio climático. Estudio de Caso",
    "autor": ['Enrique Orestes Santos. Investigador independiente.',
              'Reinaldo Hanoi Valdes Reinoso. Doctor en Ciencias Forestales.',
              'Bertha Rita Castillo EduaDoctora en Ciencias Forestales.',
              'Jennifer Sosa','Marta Bonilla Vichot' ,
              'Jesús Alonso Gil'],
    "ruta":"utls/sc-inv/proy-Olive-Land-Farms.pdf",
    "ico":"utls/sc-inv/paper-64.ico"
}
]
// ciencia e investigacion
function cambioCiencia(params) {
  let ponerDatos=document.getElementById('producto-oferta')
   // 1-vaciar
   while (ponerDatos.firstChild) {
    // The list is LIVE so it will re-index each call
    ponerDatos.removeChild(ponerDatos.firstChild);
  }
  switch (params) {
      case 'proy':
              // proys
              document.getElementById('cabeza-producto').innerHTML=' Proyectos '
              // llenar con fotos
              llenarAcc(ciencia_invest_proy,'')
              break;
      default:
          // articulos
          document.getElementById('cabeza-producto').innerHTML=` Art&iacute;culos`          
          // llenar con fotos
         llenarAcc(ciencia_invest_art,'')
          break;
  }
}


/**
 * The function `fillLiterature` creates a card structure for literature data with an icon, title, and
 * link.
 * @param literatureData - The `literatureData` parameter is an object that contains information about
 * a piece of literature. It typically includes properties such as `ico` (icon URL), `ruta` (document
 * URL), and `nomb` (document title).
 * @param literatureIcoClass - The `literatureIcoClass` parameter is a class name that will be assigned
 * to the icon element of the literature document in the HTML structure created by the `fillLiterature`
 * function. This class name is used for styling purposes, allowing you to apply specific CSS styles to
 * the icon element.
 * @param literatureTitleClass - The `literatureTitleClass` parameter is a class name that will be
 * assigned to the `<span>` element containing the title of the literature document in the generated
 * HTML structure. This class can be used for styling or targeting this specific element using CSS or
 * JavaScript.
 * @returns The function `fillLiterature` is returning a dynamically created HTML element structure
 * that represents a literature card. This structure includes an image icon representing the type of
 * document, a link to the document file, and the title of the document.
 */
function fillLiterature(literatureData,literatureIcoClass,literatureTitleClass) {
  //crear estructura cuerpo tarjeta Documento
  // imagen-tipo-literatura {enlace-doc > imagen-tipo-doc-extension año-doc titulo-doc} 

  //dentro de la tarjeta completa, el nombre
  let literatureCard_p = document.createElement('p');

  //dentro de la tarjeta completa, agrego el icono del tipo de Doc
  let doc_tipo_ico = document.createElement("img");
  doc_tipo_ico.src = literatureData.ico;//poner icono lugar valor
  doc_tipo_ico.className = literatureIcoClass;//poner icono clase valor

  literatureCard_p.appendChild(doc_tipo_ico);//agrego dentro de la tarjeta completa, agrego el icono del tipo de Doc
  
  //dentro de la tarjeta completa, el icono
  let doc_pdfLink = document.createElement("a");  
  doc_pdfLink.href =literatureData.ruta;  

  let titulo=document.createElement('span')
  titulo.innerHTML='&nbsp; '+literatureData.nomb+'&nbsp; &nbsp;'
  titulo.className=literatureTitleClass

  doc_pdfLink.appendChild(titulo);//agrego espacio entre img y vinculo

  literatureCard_p.appendChild(doc_pdfLink);//agrego dentro de la tarjeta completa, enlace de Doc 
 
//crear el div
  let div_literatura = document.createElement("div");
  div_literatura.appendChild(literatureCard_p);//agrego dentro de la tarjeta completa, agrego el p

  return div_literatura;
}

/**
 * The function `fillAuthorsLierature` creates a list of authors based on the input parameters.
 * @param params : array of authors - It seems like the `params` variable is an array containing the authors' names or
 * literature titles. The `fillAuthorsLierature` function creates a `<ul>` element and populates it
 * with `<li>` elements for each author or literature title in the `params` array. Each `<li
 * @returns An unordered list (`<ul>`) element containing list items (`<li>`) for each author in the
 * `params` array. Each list item will have the author's value set based on the elements in the
 * `params` array.
 */
function fillAuthorsLierature(params) {
  let uList=document.createElement('ul')
  params.map(elt=>{
    let author=document.createElement('li')
      author.innerHTML=elt
    uList.appendChild(author)}
    )
  return uList    
}


/**
 * The function `crearAccStack` creates a div element with literature content, author information, and
 * a link to an article.
 * @param param : array of articles - It looks like the code snippet you provided is a function called `crearAccStack` that
 * creates a stack of elements based on the `param` object passed to it. However, the `param` object
 * itself is not included in your message. If you provide me with the details of the `param
 * @returns The function `crearAccStack` is returning a dynamically created HTML element structure
 * based on the `param` object passed to it. The returned element contains a row (`div` with class
 * 'row') with various child elements such as literature image, authors, and a nested row with a
 * header, a link, and an image.
 */
function crearAccStack(param) {
  let div_row=document.createElement('div')//creando eleto row
    div_row.setAttribute( 'class','row')
    let algo=fillLiterature(param,'imgArt','bg-success text-white') //creo la literatura
    div_row.appendChild(algo) //append

    div_row.appendChild(fillAuthorsLierature(param.autor)) //append autores
  
  return div_row
}

function llenarAcc(data,root) {
  let ponerDatos=document.getElementById('producto-oferta')
  // llenar el trip
  data.map(e =>{    
      ponerDatos.appendChild(crearAccStack(e)) 
  })   
}


// fin ciencia e investigacion

function mostrarEnCarrusel(params,lugar) {
    document.getElementById("galeriaImg").src="utls/imgs/"+lugar+"/IMG-"+params+".jpg" ;
    let thumbsI=document.getElementById("thumbsSeccion").getElementsByTagName('img');
    for (const  elt of thumbsI)  {
    let claseTipo=elt.id==params ?"imagenScala20 active":"imagenScala20";
    elt.setAttribute('class',claseTipo)
    }
}

function toogleVw(dondeTxt,donde) {
  let lugar=document.getElementById(donde)
  let lugarTxt=document.getElementById(dondeTxt)
  if (lugarTxt.innerHTML=='Ampliar...') {
    lugar.style.display='block'
    lugarTxt.innerHTML='Ocultar...'
  } else {
    lugar.style.display='none'
    lugarTxt.innerHTML='Ampliar...'
  }
}

