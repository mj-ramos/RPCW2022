/*
* This module is used to validate XML files and manifests in JSON according to the specified schemas.
*/

//--------------------------------Manifest validation----------------------------
const Ajv = require("ajv")
const ajv = new Ajv() 

const manifest_schema = {
    type: "array",
    items: 
      {
        type: "object",
        properties: {
          checksum: {
            type: "string"
          },
          path: {
            type: "string"
          }
        },
        required: [
          "checksum",
          "path"
        ],
        additionalProperties: false,
      } 
}

module.exports.validate_manifest = function(json) {
    const validate = ajv.compile(manifest_schema)
    return validate(json)
}

//-------------------------------Xml validation------------------------------------

var libxml = require("libxmljs");

const xsd = `
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
<xs:element name="RRD">
    <xs:complexType>
        <xs:sequence>
            <xs:element name="meta">
                <xs:complexType>
                    <xs:sequence>
                        <xs:element type="xs:string" name="titulo"/>
                        <xs:element type="xs:string" name="descricao"/>
                        <xs:element type="xs:string" name="data_criacao"/>
                        <xs:element type="xs:string" name="produtor"/>
                        <xs:element type="xs:string" name="tipo"/>
                    </xs:sequence>
                </xs:complexType>
            </xs:element>
            <xs:element name="corpo">
                <xs:complexType>
                    <xs:sequence>
                        <xs:element maxOccurs="unbounded" type="xs:string" name="item"/>
                    </xs:sequence>
                </xs:complexType>
            </xs:element>
        </xs:sequence>
    </xs:complexType>
</xs:element>
</xs:schema>
` 

/*
var xml = `
<RRD>
    <meta>
      <titulo>Teste</titulo>
      <data_criacao>20-05-2000</data_criacao>
      <produtor>Maria</produtor>
      <tipo>Teste</tipo>
    </meta>
  <corpo>
    <item>teste</item>
  </corpo>
</RRD>
`
*/

module.exports.validate_xml = function(xml) {
    var xsdDoc = libxml.parseXml(xsd)
    var xmlDoc = libxml.parseXml(xml)
    console.log(xmlDoc.validate(xsdDoc))
    return xmlDoc.validate(xsdDoc)
}

