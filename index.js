require('@tensorflow/tfjs');
const toxicity = require('@tensorflow-models/toxicity');

const template = document.createElement('template');
template.innerHTML = `
    <div>
        <textarea></textarea>
        <div class="moderated-note"></div>
    </div>
    <style>
      :host {}
      textarea {
        padding: 10px;
      }
    .moderated-note {

    }
    .toxic {
        border: 5px solid #ff00005c;
        border-radius: 10px;
        background: #e91e6338;
    }
`;

//https://davidwalsh.name/javascript-debounce-function
const debounce = (func, wait, immediate) => {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

const threshold = 0.9;

const debouncedCheck = debounce(function(value){
    //.then(model => {
 
    //})
}, 150)

class TextareaModerated extends HTMLElement {
    
  constructor() {
    super();
    this.loadDetector();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._textarea = this.shadowRoot.querySelector('textarea');
    this.addEventListener('input', e => {
      if (this.moderationDisabled) {
        return;
      }
      this.check();
    });
  }

  get value() {
    return this._textarea.value;
  }
  
  set value(newValue) {
    this._textarea.value = newValue;
  }

  async loadDetector(){
    this._toxicityDetector = await toxicity.load(threshold)
  }

  _debouncedCheck(value) {
    const sentences =  value.split('.')
    this._toxicityDetector.classify(sentences).then(predictions => {
    const res = predictions.map(p => {
        return {
            [p.label]:p.results.map(r => r.match).find(e => e === true)
        }
        })
        console.log(res);
    })
    }

  check(){

   this._debouncedCheck(this._textarea.value)
   this._textarea.className = 'toxic'
  }
  connectedCallback() {
    //...
  }
  disconnectedCallback() {
    //...
  }
}
customElements.define('textarea-moderated', TextareaModerated);