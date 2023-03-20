// This file was generated by lezer-generator. You probably shouldn't edit it.
import {LRParser, LocalTokenGroup} from "@lezer/lr"
import {highlight} from "./highlight"
export const parser = LRParser.deserialize({
  version: 14,
  states: "!^QQOPOOOOOO'#C_'#C_OYOQO'#C^OOOO'#Cc'#CcQQOPOOOOOO'#Cd'#CdO_OQO,58xOOOO-E6a-E6aOOOO-E6b-E6bOOOO1G.d1G.d",
  stateData: "g~OUROYPO~OSTO~OSTOTXO~O",
  goto: "nXPPY^PPPbhTROSTQOSQSORVSQUQRWU",
  nodeNames: "⚠ Template Tag Open Content Close Text",
  maxTerm: 10,
  propSources: [highlight],
  skippedNodes: [0],
  repeatNodeCount: 2,
  tokenData: "![~RTOtbtuyu;'Sb;'S;=`s<%lOb~gSU~Otbu;'Sb;'S;=`s<%lOb~vP;=`<%lb~|P#o#p!P~!SP!}#O!V~![OY~",
  tokenizers: [1, new LocalTokenGroup("b~RP#P#QU~XP#q#r[~aOT~~", 17, 4)],
  topRules: {"Template":[0,1]},
  tokenPrec: 0
})
