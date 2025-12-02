// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

contract File {
    // === Control de propietarios del contrato ===
    mapping(address => bool) private owners;

    // Documento registrado en la blockchain
    struct Document {
        address uploader;   // quién registró el documento
        string filename;    // nombre del archivo (ej: "contrato.pdf")
        string hash;        // hash (SHA-256) del archivo
        string minioId;     // ID/nombre del objeto en MinIO/S3
        string tag;         // etiqueta: "contrato", "factura", etc.
        uint256 timestamp;  // fecha de registro
    }

    mapping(uint256 => Document) public documents;
    uint256 public documentCount;

    // Índice para búsqueda por nombre
    // keccak256(nombre) => lista de IDs
    mapping(bytes32 => uint256[]) private docsByName;

    // Eventos
    event DocumentRegistered(
        uint256 indexed id,
        address indexed uploader,
        string filename,
        string hash,
        string minioId,
        string tag,
        uint256 timestamp
    );

    event OwnerAdded(address indexed newOwner);

    // === Constructor ===
    constructor() {
        owners[msg.sender] = true; // el deployer es owner
    }

    // === Modificador de seguridad ===
    modifier onlyOwners() {
        require(owners[msg.sender], "You are not an owner");
        _;
    }

    // Agregar más owners
    function addOwner(address newOwner) external onlyOwners {
        require(newOwner != address(0), "Invalid address");
        owners[newOwner] = true;
        emit OwnerAdded(newOwner);
    }

    function isOwner(address account) external view returns (bool) {
        return owners[account];
    }

    // === Registrar documento (GRATIS) ===
    function registerDocument(
        string calldata filename,
        string calldata fileHash,
        string calldata minioId,
        string calldata tag
    ) external onlyOwners returns (uint256 id) {
        require(bytes(filename).length > 0, "Filename required");
        require(bytes(fileHash).length > 0, "Hash required");
        require(bytes(minioId).length > 0, "MinIO ID required");

        id = documentCount;

        documents[id] = Document({
            uploader: msg.sender,
            filename: filename,
            hash: fileHash,
            minioId: minioId,
            tag: tag,
            timestamp: block.timestamp
        });

        // Indexación por nombre
        bytes32 nameKey = keccak256(bytes(filename));
        docsByName[nameKey].push(id);

        documentCount++;

        emit DocumentRegistered(
            id,
            msg.sender,
            filename,
            fileHash,
            minioId,
            tag,
            block.timestamp
        );

        return id;
    }

    // === Verificar documento por hash ===
    function verifyDocument(uint256 id, string calldata givenHash)
        external
        view
        returns (bool)
    {
        require(id < documentCount, "Invalid document id");
        return keccak256(bytes(documents[id].hash)) ==
               keccak256(bytes(givenHash));
    }

    // === Buscar documentos por nombre ===
    function getDocumentsByName(string calldata filename)
        external
        view
        returns (uint256[] memory)
    {
        bytes32 nameKey = keccak256(bytes(filename));
        return docsByName[nameKey];
    }

    // Obtener un documento
    function getDocument(uint256 id)
        external
        view
        returns (Document memory)
    {
        require(id < documentCount, "Invalid document id");
        return documents[id];
    }
}
