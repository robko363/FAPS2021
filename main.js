const fs = require('fs');
const snow = require('./adapted_snow10');

/*using StegCloak v 1.1.1
    title: StegCloak
    author: Jyothishmathi CV, Kandavel A, Mohanasundar M
    avaible at: https://github.com/KuroLabs/stegcloak
*/
const StegCloak = require('stegcloak');      

/*using Zero-Width Unicode Character Steganography
    title: Zero-Width Unicode Character Steganography
    author: Kei Misawa
    avaible at: http://330k.github.io/misc_tools/unicode_steganography.js
*/
const { unicodeSteganographer } = require('./Unicode_steganography/unicode_steganography');

/**
    Encode file using unicode_steganography
    @param file_name {String} name of the file in work folder (String)
    @param cover {String} cover text (String)
    @returns {String} stego text (String)
**/
function encode_file_with_name_unicode_steganography(file_name, cover) {
    if (file_name.includes(':')) {
        throw new Error('File name cannot contain colon(:)');
    }
    var file_data = fs.readFileSync(file_name);
    if (file_data === 'undefined') {
        return;
    }
    var add_name = 'us'+file_name + ':';
    var buf = Buffer.alloc(add_name.length);              //new TextEncoder().encode(add_name);
    for (var i = 0; i < add_name.length; i++) {
        buf[i] = add_name.charCodeAt(i);
    }
    var stego_with_name = unicodeSteganographer.encodeBinary(cover, Buffer.concat([buf, file_data]));
    return stego_with_name;
}

/**
    Decode and save file with unicode_steganography
    @param stego {String} text with hidden file (String)
**/
function decode_file_with_name_unicode_steganography(stego) {
    var decoded = unicodeSteganographer.decodeBinary(stego);
    var cover = decoded.originalText;
    console.log('Original cover text: ' + cover);
    var hidden_data = decoded.hiddenData;
    var index = 0;
    var file_name = '';//new TextDecoder().decode(hidden_data); //String.fromCharCode.apply(null, hidden_data);                                                           //convert to string
    for (var i=0; i<hidden_data.length; i++) {
        if (String.fromCharCode(hidden_data[i]) === ':') {                                          //break at colon
            index = i;
            break;
        }
        file_name += String.fromCharCode(hidden_data[i]);
    }
    var content_buf = hidden_data.slice(index+1, hidden_data.length);
    fs.writeFileSync(file_name,content_buf);
    console.log("File saved: " + file_name);
}

/**
    Hide a file using StegCloak
    @param file_name {String} name of the file in work folder (String)
    @param cover {String} cover text (String)
    @param encryption {boolean} whether to use encryption or not (boolean)
    @param hmac {boolean} whether to use hmac or not (boolean)
    @param password {String} password to be used if encryption is selected (String)
    @returns {String} stego text (String)
**/
function encode_file_with_name_stegcloak(file_name, cover, encryption, hmac, password) {
    if (file_name.includes(':')) {
        throw new Error('File name cannot contain colon(:)');
    }
    var sc = new StegCloak(encryption, hmac)
    var file_data = fs.readFileSync(file_name);            //utf-8 for string
    if (file_data === 'undefined') {
        return;
    }
    var add_name = 'sc' + file_name + ':';
    var data_string = '';                                                               //convert to string
    for (var i=0; i<file_data.length; i++) {
        data_string += String.fromCharCode(file_data[i]);
    }
    var stego_with_name = sc.hide(add_name+data_string, password, cover);
    return stego_with_name;
}

/**
    Decode a file using StegCloak and save file
    @param stego {String} stego text (String)
    @param encryption {boolean} whether to use encryption or not (boolean)
    @param hmac {boolean} whether to use hmac or not (boolean)
    @param password {String} password to be used if encryption is selected (String)
**/
function decode_file_with_name_stegcloak(stego, encryption, hmac, password) {
    var sc = new StegCloak(encryption, hmac);
    var decoded = sc.reveal(stego, password);
    var index = decoded.indexOf(':');
    var file_name = decoded.substr(0, index);
    buffer = Buffer.alloc(decoded.length-index-1);
    for (var i = index + 1; i < decoded.length; i++) {
        buffer[i-index-1] = decoded.charCodeAt(i);
    }
    fs.writeFileSync(file_name,buffer);
    console.log("File saved: " + file_name);
}

//susage snippets

//Unicode_steganography
/*
var s = encode_file_with_name_unicode_steganography('smile.png', 'hello there');
fs.writeFileSync('us_stego.txt', s, 'utf8', (err) => {
    if (err) {
        console.log('Error creating file');
        return;
    }
})
var data = fs.readFileSync('us_stego.txt', 'utf8');      
decode_file_with_name_unicode_steganography(data);*/


//StegCloak
/*
var q = encode_file_with_name_stegcloak('smile.png', 'hello there', false, false, 'FAPS2021');
fs.writeFileSync('sc_stego.txt', q, 'utf8', (err) => {
    if (err) {
        console.log('Error creating file');
        return;
    }
})
var data = fs.readFileSync('sc_stego.txt', 'utf8');                                                 
decode_file_with_name_stegcloak(data, false, false, 'FAPS2021');*/


//snow10
/*
var x =snow.hide_file('smile.png', false, 'FAPS2021');             
fs.writeFileSync('snow_stego.txt', x, 'utf8', (err) => {
    if (err) {
        console.log('Error writing file');
        return;
    }
});
var data = fs.readFileSync('snow_stego.txt', 'utf8');                                           
snow.reveal_file(data, false, 'FAPS2021');*/

/*
unicodeSteganographer.setUseChars('-_');
var cover = 'Twinkle, twinkle, little star\r\nHow I wonder what you are\r\nUp above the world so high\r\nLike a diamond in the sky\r\nTwinkle, twinkle little star\r\nHow I wonder what you are'
var secret = 'The quick brown fox jumps over a lazy dog.';
var out = unicodeSteganographer.encodeText(cover, secret);
fs.writeFileSync('us-_.txt', out, 'utf8', (err) => {
    if (err) {
        console.log('Error writing file');
        return;
    }
});
var retrieved = unicodeSteganographer.decodeText(out);
console.log(retrieved);*/
