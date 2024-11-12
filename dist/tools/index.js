"use strict";var e=require("fs"),o=require("crypto"),n=require("readline"),t=require("dotenv");function r(e){var o=Object.create(null);return e&&Object.keys(e).forEach((function(n){if("default"!==n){var t=Object.getOwnPropertyDescriptor(e,n);Object.defineProperty(o,n,t.get?t:{enumerable:!0,get:function(){return e[n]}})}})),o.default=e,Object.freeze(o)}var c=r(n);t.config({override:!0});const s=process.env.ENCRYPTION_KEY,l=process.env.ENCRYPTION_IV;function i(e,n){void 0!==s&&void 0!==l||(console.error("Please provide a KEY and IV in the .env file"),process.exit(1));const t=Buffer.from(s,"hex"),r=Buffer.from(l,"hex");let c="";e.stdoutMuted=!0,e.setPrompt("Enter your password: "),e.prompt(),e._writeToOutput=function(o){var n,t;e.stdoutMuted?null===(n=e.output)||void 0===n||n.write(""):null===(t=e.output)||void 0===t||t.write(o)},console.log(),e.on("line",(s=>{c=s,console.log(),e.stdoutMuted=!1;const l=function(e){const n=o.createCipheriv("aes-256-cbc",t,r);let c=n.update(e,"utf8","hex");return c+=n.final("hex"),c}(c);console.log(),console.log("##################################"),console.log("Encrypted password:"),console.log("----------------------------------"),console.log(),console.log(l),console.log(),console.log("##################################"),console.log(),n()}))}t.config({override:!0});const u=process.env.ENCRYPTION_KEY,a=process.env.ENCRYPTION_IV;function p(e,n){e.stdoutMuted=!1,e.setPrompt("Enter your encrypted string: "),e.prompt(),e._writeToOutput=function(o){var n,t;e.stdoutMuted?null===(n=e.output)||void 0===n||n.write(""):null===(t=e.output)||void 0===t||t.write(o)},console.log(),e.on("line",(t=>{console.log(),e.stdoutMuted=!1;const r=(e=>{void 0!==u&&void 0!==a||(console.error("Please provide a KEY and IV in the .env file"),console.error("or run the command:\n$\tnpm run cli generate-key"),process.exit(1));const n=Buffer.from(u,"hex"),t=Buffer.from(a,"hex");if(console.log("KEY:",n.length),console.log("IV:",t.length),32!==n.length||16!==t.length)throw new Error("Invalid KEY or IV length. KEY must be 32 bytes and IV must be 16 bytes.");try{const r=o.createDecipheriv("aes-256-cbc",n,t);let c=r.update(e,"hex","utf8");return c+=r.final("utf8"),c}catch(e){throw console.error("Decryption error:",e.message),e}})(t);console.log(),console.log("##################################"),console.log("Decrypted password:"),console.log("----------------------------------"),console.log(),console.log(r),console.log(),console.log("##################################"),console.log(),n()}))}function d(){const n=o.randomBytes(32),t=o.randomBytes(16);console.log("key:",n.toString("hex")),console.log("iv:",t.toString("hex"));const r=`\n# Encryption key and IV\n\nENCRYPTION_KEY=${n.toString("hex")}\nENCRYPTION_IV=${t.toString("hex")}\n`;e.writeFileSync(".env",r),console.log("Key and IV written to .env")}"generate-key"===process.argv[2]&&(d(),process.exit(0)),function(){let e="main_menu";const o=c.createInterface({input:process.stdin,output:process.stdout,prompt:"Select a function: "});function n(){e="main_menu",o.close()}const t={1:{name:"Encrypt Password",function:()=>i(o,n)},2:{name:"Decrypt Input",function:()=>p(o,n)}};!function(){const e=process.env.ENCRYPTION_KEY,o=process.env.ENCRYPTION_IV;void 0!==e&&void 0!==o||(console.error("Please provide a KEY and IV in the .env file"),console.error("or run the command:\n$\tnpm run cli generate-key"),process.exit(1))}(),console.log("Available functions:"),Object.keys(t).forEach((e=>{console.log(`[${e}] ${t[e].name}`)})),console.log("----------------------------------"),console.log("Type the number of the function you want to use"),console.log(),o.resume(),o.prompt(),o.on("line",(n=>{const r=t[n];"main_menu"===e&&(r?(e=n,console.log(),r.function()):(console.log("Invalid command"),o.prompt()))})).on("close",(()=>{console.log("Have a great day!"),process.exit}))}(),exports.generateKeyAndIV=d;