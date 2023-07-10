const inpFile = document.getElementById("inpFile");
const inpNumero = document.getElementById("inp-numero");
const textFile = document.getElementById("textFile");
const btnUpload = document.getElementById("btnUpload");
const resultText = document.getElementById("resultText");
const ul = document.getElementById("ul");

btnUpload.disabled = true;

let numero = 0;

inpNumero.oninput = (e) => {
  console.log("onchange");
  numero = inpNumero.value;
  console.log(numero);
};

const abrirNovedad = (dni, numero) => {
  window.open(
    `https://sige.tierradelfuego.gob.ar/SIGEGX/novedadespendientes.aspx?${numero},ILI,PDT,,,${dni},`,
    "_blank"
  );
};

const getUniqueDNI = (text) => {
  console.log("entro");
  if (text) {
    while (ul.firstChild) {
      ul.removeChild(ul.firstChild);
    }
    const textArray = text.split(/\/|\s/);
    //console.log("textarray", textArray);
    let dniArray = textArray.filter((word) => /\d{8,}$/.test(word));
    dniArray = dniArray.map((dni) => dni.slice(-8));
    //console.log(dniArray);
    const uniqueDNI = [...new Set(dniArray)].sort((a, b) => a - b);
    console.log(uniqueDNI);
    uniqueDNI.map((dni) => {
      //crear li para dni
      const node = document.createElement("li");
      node.appendChild(document.createTextNode(dni));
      node.addEventListener("click", () => {
        node.classList.toggle("complete");
      });
      ul.appendChild(node);
      // crear btn abrir
      const btn = document.createElement("button");
      btn.addEventListener("click", () => abrirNovedad(dni, numero));
      btn.id = "btn-abrir";
      btn.innerText = "Abrir";
      node.appendChild(btn);
    });
  }
};

inpFile.addEventListener("change", () => {
  if (inpFile.value) {
    textFile.innerHTML = inpFile.value.match(/[\/\\]([\w\d\s\.\-\(\)]+)$/)[1];
    btnUpload.disabled = false;
  } else {
    textFile.innerHTML = "Ningun Archivo Seleccionado";
  }
});

btnUpload.addEventListener("click", () => {
  let textoPDF = "";
  const file = inpFile.files[0];
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.onload = () => {
    const pdfData = new Uint8Array(reader.result);
    pdfjsLib.getDocument({ data: pdfData }).promise.then((pdf) => {
      const numPages = pdf.numPages;
      let pagesText = [];

      for (let i = 1; i <= numPages; i++) {
        pdf.getPage(i).then((page) => {
          page.getTextContent().then((textContent) => {
            const pageText = textContent.items.map((item) => item.str).join("");
            pagesText.push(pageText);
            if (pagesText.length === numPages) {
              const allText = pagesText.join("\n");
              //console.log(allText);
              textoPDF = allText;
              getUniqueDNI(textoPDF);
            }
          });
        });
      }
    });
  };
});
