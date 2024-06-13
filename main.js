const {Readable} = require('stream');

class newStream extends Readable{
    #count = 0
    _read(size) {
      this.push(':-)')
      if (this.#count++ === 5) { this.push(null) }
    }
}
const stream = new newStream();
stream.on("data", (chunk)=>{
    console.log(chunk.toString(), "streams");
})