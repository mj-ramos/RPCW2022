var admzip = require("adm-zip")
var parseString = require('xml2js').parseString;
var os = require('os')
var path = require('path')
var operations = require('./operations')
var checksum = require('checksum')
var ValidationSchema =  require('./validationWithSchemas')


function calculateChecksum(fileData) {
  return checksum(fileData);
}

/* 
 * Verify SHA-1 checksum.
 */
function verifyChecksum(fileData,givenChecksum) { 
  let calculatedChecksum = checksum(fileData)
  console.log('Calculated checksum: ', calculatedChecksum, 'Checksum indicated: ', givenChecksum)

  if (calculatedChecksum == givenChecksum) {
    return true
  } 
  console.log('Checksum invalid.')
  return false
}

/**
 * Verifies if server needs to ask for metainformation for the file based on the type of file (if it isn't a xml).
 */
function metaStatus(filesNames,zip) {
  let res = {filesNeedMeta: [], xmlFiles: []}

  for (const fileName of filesNames) {
    let fileType = fileName.split('.')[1];
    if (fileType!='xml') {
      res.filesNeedMeta.push(fileName);
    } else {
      let xmlEntry = zip.getEntry(fileName);
      let resValidateXml = ValidationSchema.validate_xml(xmlEntry.getData().toString('utf8'));
      if (!resValidateXml) {throw new Error(`Ficheiro ${fileName} com formato errado.`)}
      res.xmlFiles.push(fileName)
    }
  }
  return res;
}

function metaFromXml(fileName,zip) {
  let xml = (zip.getEntry(fileName)).getData().toString('utf8');
  let res;
    
  parseString(xml, function (err, result) {
    res = result.RRD.meta[0];
    res.title = res.titulo[0];
    res.desc = res.descricao[0];
    res.date_creation = res.data_criacao[0];
    res.producer = res.produtor[0];
    res.type = res.tipo[0];
    res.file_name = fileName;

    delete res.titulo;
    delete res.descricao;
    delete res.data_criacao;
    delete res.produtor;
    delete res.tipo;
  });

  return res;
}

/**
 * Function that verifies all checksums. To be used after confirming all files are referenced by the manifest and 
 * all files referenced by the manifest are present. 
 */
function verifyChecksums(zip, checksums) {
  for (let zipEntry of zip.getEntries()) {
    if (!zipEntry.isDirectory) {
    console.log(zipEntry.entryName)
    let fileData = zipEntry.getData()
    let entryName = JSON.parse(zipEntry.toString()).entryName

    if (entryName!='RRD-SIP.json' && !verifyChecksum(fileData, checksums[entryName])) return false
    }
  }
  return true
}

/** 
 * Validates a SIP. Verifies the manifest, checksums and indicates the need of more information in case the file is not a XML. 
 * @returns List of files that need more information.
 */  
function validateSIP(fileName) {
  if (os.type() == 'Windows_NT') {
    filepath = path.normalize(__dirname + '\\..\\storage\\SIPstore\\' + fileName);
  } else {
    filepath = path.normalize(__dirname + '/../storage/SIPstore/' + fileName);
  }

  console.log(filepath)

  let zip;

  try {
    zip = new admzip(filepath);
  } catch (error) {
    console.log(error)
    throw new Error('Erro interno.');
  }

  let manifest = undefined;
  var entriesNames = [];

  for (const zipEntry of zip.getEntries()) {
    //let entry = JSON.parse(zipEntry.toString())
    {
      if (!zipEntry.isDirectory)
        entriesNames.push(zipEntry.entryName)

      if (zipEntry.entryName == 'RRD-SIP.json') 
        manifest = zipEntry     
    }
  }

  if (manifest==undefined) {
    throw new Error('Manifesto não encontrado!');
  } 

  //Read manifest
  try {
    manifest = JSON.parse(manifest.getData().toString('utf8'));
  } catch (error) {
    throw new Error('Verifique se o json está bem formatado.');
  }
  
  //Verify manifest format
  if (!ValidationSchema.validate_manifest(manifest)) {
    throw new Error(`Formato do manifesto errado! Formato correto: [ { "checksum" : ______, "path": ________ } (, ...) ]`);
  } 

  manifestFileNames = [];
  operations.removeElem('RRD-SIP.json',entriesNames);
  var checksums = {};

  manifest.forEach(reg => {
    manifestFileNames.push(reg.path);
    checksums[reg.path] = reg.checksum;
  })

  //Verifies if all files are referenced by the manifest and if all files in the manifest are present in the SIP
  if (!operations.sameElements(manifestFileNames,entriesNames)) {
    console.log(manifestFileNames,entriesNames)
    throw new Error('Manifesto incorreto! Verifique se todos os ficheiros no manifesto estão no SIP e se todos os ficheiros do SIP são referenciados pelo manifesto.');
  }

  if (!verifyChecksums(zip,checksums)) {
    throw new Error('Ocorreu um erro no upload. Os checksums estão incorretos.');
  }

  return metaStatus(entriesNames,zip);
}
  

module.exports.validateSIP = validateSIP
module.exports.metaFromXml = metaFromXml
module.exports.calculateChecksum = calculateChecksum
