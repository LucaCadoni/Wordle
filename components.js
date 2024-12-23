class WordleRow extends HTMLElement{
    start = null;
    last = null;

    constructor(callback, len = 0){
        super();

        for(let i = 0; i < len; i++){
            this.appendNode(callback);
        }
    }

    get length(){
        cont = 0;
        current = this.start;
        while(current){
            cont ++;
            current = current.next;
        }
        return cont;
    }

    appendNode(callback, node = null){
        if(!this.start){
            this.start = new WordleNode(null, node);
            this.last = this.start;
        }else{
            this.last.next = new WordleNode(this.last, node);
            this.last = this.last.next;
        }
        this.last.callback = callback;
        this.appendChild(this.last.target);
    }

    get(index){
        let i = 0;
        let current = this.start;
        while(i < index){
            current = current.next;
            i++;
        }
        return current;
    }

    get value(){
        let str = "";
        let current = this.start;
        while(current){
            str += current.input.value;
            current = current.next;
        }
        return str;
    }

    set disabled(value){
        let current = this.start;
        while(current){
            current.input.disabled = value;
            current = current.next;
        }
    }

    isFill(){
        let fill = true;
        let current = this.start;
        while(current){
            if(current.input.value == "")
                fill = false;
            current = current.next;
        }
        return fill;
    }
}

class WordleNode{

    target = null;
    prec = null;
    next = null;
    input = null;
    callback = null;

    constructor(prec = null, target = null, next = null){
        this.prec = prec;
        this.terget = target;
        this.next = next;

        if(!this.target){
            let node = document.createElement("div");
            node.classList.add("letter");
    
            this.input = document.createElement("input");
            this.input.type = "text";
            this.input.maxLength = 1;
            this.input.addEventListener("input", event =>{

                console.log(event);
                if(event.inputType == "deleteContentBackward"){
                    if(this.input.value.length == 0 && this.prec){
                        setTimeout(()=> {this.prec.input.focus()}, 10);
                    }
                }else{
                    //event.preventDefault();
                    this.input.value = this.input.value.toUpperCase();
                    if(this.next){
                        this.next.input.focus();
                    }
                }
                
                
                if(this.callback)
                    setTimeout(()=> {this.callback()}, 10);

            });
    
            node.appendChild(this.input);

            this.target = node;
        }else{
            this.input = this.target.querySelector('input');
        }
    }
}

class Wordle extends HTMLElement{
    
    memory = [];
    words = ["ULIVO", "VOLPE", "EXTRA", "BISCA"];
    word = "";

    constructor(wordPos){
        super();
        this.word = this.words[wordPos];
        this.memory = [];
        this.start();
    }

    start(){
        row.classList.remove("show");
        this.innerHTML = "";
        this.memory = [];
        this.appendRow();
    }

    lose(){
        row.classList.toggle("show");
        row.querySelector(".row button").addEventListener("click", this.start.bind(this));
    }

    appendRow(){
        let row = new WordleRow(this.checkRow.bind(this), this.word.length);
        console.log(row);
        console.log(this);
        this.memory.push(row);
        this.appendChild(row);
    }

    checkRow(){
        let last = this.memory.length - 1;
        let win = true;

        if(!this.memory[last].isFill())
            return true;

        this.memory[last].disabled = true;

        for(let i=0; i<this.word.length; i++){
            let letter = this.memory[last].get(i);
            console.log(letter);
            let value = letter.input.value;
            if(value == this.word[i]){
                letter.target.classList.add("correct");
            }else if(this.word.includes(value)){
                letter.target.classList.add("semicorrect");
                win = false;
            }else{
                letter.target.classList.add("notcorrect");
                win = false;
            }
        }

        if(!win){
            if(this.memory.length < 5){
                this.appendRow();
                this.memory[last+1].get(0).input.focus();
            }else this.lose();
        }
    }
}

customElements.define("c-wordle", Wordle);
customElements.define("wordle-row", WordleRow);

var info = null;
var row = null;

function error(){
    document.body.classList.add("center");
    document.body.innerHTML = `
        <h2>
            Ei questo link è sbagliato!
        </h2>
        <p>Prova a riscannerizzare il qr code oppure contatta <b>luca il bellissimo</b></p>
    `;
}

window.onload = () => {

    row = document.querySelector(".row");

    document.querySelector(".info").addEventListener("click", ()=>{
        info = document.getElementById("info-text");
        info.classList.toggle("open");
    });

    param = window.location.search;
    console.log(param);
    if(!param){
        console.error("no param");
        throw error();
    }

    let pos = 0;
    try{
        pos = parseInt(param.replace('?', '').split('=')[1]);
        console.log(pos);
    }catch{
        throw error();
    }

    if(pos >= 4 || pos < 0 || (!pos && pos != 0)){
        throw error();
    }

    x = new Wordle(pos);
    document.body.appendChild(x);
}

window.onclick = (e)=>{
    if(info && !e.target.classList.contains("info"))
        info.classList.remove("open");
}
