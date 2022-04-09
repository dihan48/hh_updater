export const HHTOKEN = process.env?.HHTOKEN;
export const RESUMEHASH = process.env?.RESUMEHASH;

if (HHTOKEN == null) console.log("need to set a hhtoken");
if (RESUMEHASH == null) console.log("need to set a resume hash");
