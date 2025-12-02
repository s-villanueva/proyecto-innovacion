// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package contracts

import (
	"errors"
	"math/big"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/event"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = errors.New
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
	_ = abi.ConvertType
)

// FileDocument is an auto generated low-level Go binding around an user-defined struct.
type FileDocument struct {
	Uploader  common.Address
	Filename  string
	Hash      string
	MinioId   string
	Tag       string
	Timestamp *big.Int
}

// ContractsMetaData contains all meta data concerning the Contracts contract.
var ContractsMetaData = &bind.MetaData{
	ABI: "[{\"inputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"id\",\"type\":\"uint256\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"uploader\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"string\",\"name\":\"filename\",\"type\":\"string\"},{\"indexed\":false,\"internalType\":\"string\",\"name\":\"hash\",\"type\":\"string\"},{\"indexed\":false,\"internalType\":\"string\",\"name\":\"minioId\",\"type\":\"string\"},{\"indexed\":false,\"internalType\":\"string\",\"name\":\"tag\",\"type\":\"string\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"timestamp\",\"type\":\"uint256\"}],\"name\":\"DocumentRegistered\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"OwnerAdded\",\"type\":\"event\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"addOwner\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"documentCount\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"documents\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"uploader\",\"type\":\"address\"},{\"internalType\":\"string\",\"name\":\"filename\",\"type\":\"string\"},{\"internalType\":\"string\",\"name\":\"hash\",\"type\":\"string\"},{\"internalType\":\"string\",\"name\":\"minioId\",\"type\":\"string\"},{\"internalType\":\"string\",\"name\":\"tag\",\"type\":\"string\"},{\"internalType\":\"uint256\",\"name\":\"timestamp\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"id\",\"type\":\"uint256\"}],\"name\":\"getDocument\",\"outputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"uploader\",\"type\":\"address\"},{\"internalType\":\"string\",\"name\":\"filename\",\"type\":\"string\"},{\"internalType\":\"string\",\"name\":\"hash\",\"type\":\"string\"},{\"internalType\":\"string\",\"name\":\"minioId\",\"type\":\"string\"},{\"internalType\":\"string\",\"name\":\"tag\",\"type\":\"string\"},{\"internalType\":\"uint256\",\"name\":\"timestamp\",\"type\":\"uint256\"}],\"internalType\":\"structFile.Document\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"string\",\"name\":\"filename\",\"type\":\"string\"}],\"name\":\"getDocumentsByName\",\"outputs\":[{\"internalType\":\"uint256[]\",\"name\":\"\",\"type\":\"uint256[]\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"}],\"name\":\"isOwner\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"string\",\"name\":\"filename\",\"type\":\"string\"},{\"internalType\":\"string\",\"name\":\"fileHash\",\"type\":\"string\"},{\"internalType\":\"string\",\"name\":\"minioId\",\"type\":\"string\"},{\"internalType\":\"string\",\"name\":\"tag\",\"type\":\"string\"}],\"name\":\"registerDocument\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"id\",\"type\":\"uint256\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"id\",\"type\":\"uint256\"},{\"internalType\":\"string\",\"name\":\"givenHash\",\"type\":\"string\"}],\"name\":\"verifyDocument\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"}]",
}

// ContractsABI is the input ABI used to generate the binding from.
// Deprecated: Use ContractsMetaData.ABI instead.
var ContractsABI = ContractsMetaData.ABI

// Contracts is an auto generated Go binding around an Ethereum contract.
type Contracts struct {
	ContractsCaller     // Read-only binding to the contract
	ContractsTransactor // Write-only binding to the contract
	ContractsFilterer   // Log filterer for contract events
}

// ContractsCaller is an auto generated read-only Go binding around an Ethereum contract.
type ContractsCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// ContractsTransactor is an auto generated write-only Go binding around an Ethereum contract.
type ContractsTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// ContractsFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type ContractsFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// ContractsSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type ContractsSession struct {
	Contract     *Contracts        // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// ContractsCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type ContractsCallerSession struct {
	Contract *ContractsCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts    // Call options to use throughout this session
}

// ContractsTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type ContractsTransactorSession struct {
	Contract     *ContractsTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts    // Transaction auth options to use throughout this session
}

// ContractsRaw is an auto generated low-level Go binding around an Ethereum contract.
type ContractsRaw struct {
	Contract *Contracts // Generic contract binding to access the raw methods on
}

// ContractsCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type ContractsCallerRaw struct {
	Contract *ContractsCaller // Generic read-only contract binding to access the raw methods on
}

// ContractsTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type ContractsTransactorRaw struct {
	Contract *ContractsTransactor // Generic write-only contract binding to access the raw methods on
}

// NewContracts creates a new instance of Contracts, bound to a specific deployed contract.
func NewContracts(address common.Address, backend bind.ContractBackend) (*Contracts, error) {
	contract, err := bindContracts(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &Contracts{ContractsCaller: ContractsCaller{contract: contract}, ContractsTransactor: ContractsTransactor{contract: contract}, ContractsFilterer: ContractsFilterer{contract: contract}}, nil
}

// NewContractsCaller creates a new read-only instance of Contracts, bound to a specific deployed contract.
func NewContractsCaller(address common.Address, caller bind.ContractCaller) (*ContractsCaller, error) {
	contract, err := bindContracts(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &ContractsCaller{contract: contract}, nil
}

// NewContractsTransactor creates a new write-only instance of Contracts, bound to a specific deployed contract.
func NewContractsTransactor(address common.Address, transactor bind.ContractTransactor) (*ContractsTransactor, error) {
	contract, err := bindContracts(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &ContractsTransactor{contract: contract}, nil
}

// NewContractsFilterer creates a new log filterer instance of Contracts, bound to a specific deployed contract.
func NewContractsFilterer(address common.Address, filterer bind.ContractFilterer) (*ContractsFilterer, error) {
	contract, err := bindContracts(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &ContractsFilterer{contract: contract}, nil
}

// bindContracts binds a generic wrapper to an already deployed contract.
func bindContracts(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := ContractsMetaData.GetAbi()
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, *parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Contracts *ContractsRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Contracts.Contract.ContractsCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Contracts *ContractsRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Contracts.Contract.ContractsTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Contracts *ContractsRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Contracts.Contract.ContractsTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Contracts *ContractsCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Contracts.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Contracts *ContractsTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Contracts.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Contracts *ContractsTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Contracts.Contract.contract.Transact(opts, method, params...)
}

// DocumentCount is a free data retrieval call binding the contract method 0xa5b16b2e.
//
// Solidity: function documentCount() view returns(uint256)
func (_Contracts *ContractsCaller) DocumentCount(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Contracts.contract.Call(opts, &out, "documentCount")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// DocumentCount is a free data retrieval call binding the contract method 0xa5b16b2e.
//
// Solidity: function documentCount() view returns(uint256)
func (_Contracts *ContractsSession) DocumentCount() (*big.Int, error) {
	return _Contracts.Contract.DocumentCount(&_Contracts.CallOpts)
}

// DocumentCount is a free data retrieval call binding the contract method 0xa5b16b2e.
//
// Solidity: function documentCount() view returns(uint256)
func (_Contracts *ContractsCallerSession) DocumentCount() (*big.Int, error) {
	return _Contracts.Contract.DocumentCount(&_Contracts.CallOpts)
}

// Documents is a free data retrieval call binding the contract method 0xc2ed2b05.
//
// Solidity: function documents(uint256 ) view returns(address uploader, string filename, string hash, string minioId, string tag, uint256 timestamp)
func (_Contracts *ContractsCaller) Documents(opts *bind.CallOpts, arg0 *big.Int) (struct {
	Uploader  common.Address
	Filename  string
	Hash      string
	MinioId   string
	Tag       string
	Timestamp *big.Int
}, error) {
	var out []interface{}
	err := _Contracts.contract.Call(opts, &out, "documents", arg0)

	outstruct := new(struct {
		Uploader  common.Address
		Filename  string
		Hash      string
		MinioId   string
		Tag       string
		Timestamp *big.Int
	})
	if err != nil {
		return *outstruct, err
	}

	outstruct.Uploader = *abi.ConvertType(out[0], new(common.Address)).(*common.Address)
	outstruct.Filename = *abi.ConvertType(out[1], new(string)).(*string)
	outstruct.Hash = *abi.ConvertType(out[2], new(string)).(*string)
	outstruct.MinioId = *abi.ConvertType(out[3], new(string)).(*string)
	outstruct.Tag = *abi.ConvertType(out[4], new(string)).(*string)
	outstruct.Timestamp = *abi.ConvertType(out[5], new(*big.Int)).(**big.Int)

	return *outstruct, err

}

// Documents is a free data retrieval call binding the contract method 0xc2ed2b05.
//
// Solidity: function documents(uint256 ) view returns(address uploader, string filename, string hash, string minioId, string tag, uint256 timestamp)
func (_Contracts *ContractsSession) Documents(arg0 *big.Int) (struct {
	Uploader  common.Address
	Filename  string
	Hash      string
	MinioId   string
	Tag       string
	Timestamp *big.Int
}, error) {
	return _Contracts.Contract.Documents(&_Contracts.CallOpts, arg0)
}

// Documents is a free data retrieval call binding the contract method 0xc2ed2b05.
//
// Solidity: function documents(uint256 ) view returns(address uploader, string filename, string hash, string minioId, string tag, uint256 timestamp)
func (_Contracts *ContractsCallerSession) Documents(arg0 *big.Int) (struct {
	Uploader  common.Address
	Filename  string
	Hash      string
	MinioId   string
	Tag       string
	Timestamp *big.Int
}, error) {
	return _Contracts.Contract.Documents(&_Contracts.CallOpts, arg0)
}

// GetDocument is a free data retrieval call binding the contract method 0x3f9b250a.
//
// Solidity: function getDocument(uint256 id) view returns((address,string,string,string,string,uint256))
func (_Contracts *ContractsCaller) GetDocument(opts *bind.CallOpts, id *big.Int) (FileDocument, error) {
	var out []interface{}
	err := _Contracts.contract.Call(opts, &out, "getDocument", id)

	if err != nil {
		return *new(FileDocument), err
	}

	out0 := *abi.ConvertType(out[0], new(FileDocument)).(*FileDocument)

	return out0, err

}

// GetDocument is a free data retrieval call binding the contract method 0x3f9b250a.
//
// Solidity: function getDocument(uint256 id) view returns((address,string,string,string,string,uint256))
func (_Contracts *ContractsSession) GetDocument(id *big.Int) (FileDocument, error) {
	return _Contracts.Contract.GetDocument(&_Contracts.CallOpts, id)
}

// GetDocument is a free data retrieval call binding the contract method 0x3f9b250a.
//
// Solidity: function getDocument(uint256 id) view returns((address,string,string,string,string,uint256))
func (_Contracts *ContractsCallerSession) GetDocument(id *big.Int) (FileDocument, error) {
	return _Contracts.Contract.GetDocument(&_Contracts.CallOpts, id)
}

// GetDocumentsByName is a free data retrieval call binding the contract method 0x974c0fe3.
//
// Solidity: function getDocumentsByName(string filename) view returns(uint256[])
func (_Contracts *ContractsCaller) GetDocumentsByName(opts *bind.CallOpts, filename string) ([]*big.Int, error) {
	var out []interface{}
	err := _Contracts.contract.Call(opts, &out, "getDocumentsByName", filename)

	if err != nil {
		return *new([]*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new([]*big.Int)).(*[]*big.Int)

	return out0, err

}

// GetDocumentsByName is a free data retrieval call binding the contract method 0x974c0fe3.
//
// Solidity: function getDocumentsByName(string filename) view returns(uint256[])
func (_Contracts *ContractsSession) GetDocumentsByName(filename string) ([]*big.Int, error) {
	return _Contracts.Contract.GetDocumentsByName(&_Contracts.CallOpts, filename)
}

// GetDocumentsByName is a free data retrieval call binding the contract method 0x974c0fe3.
//
// Solidity: function getDocumentsByName(string filename) view returns(uint256[])
func (_Contracts *ContractsCallerSession) GetDocumentsByName(filename string) ([]*big.Int, error) {
	return _Contracts.Contract.GetDocumentsByName(&_Contracts.CallOpts, filename)
}

// IsOwner is a free data retrieval call binding the contract method 0x2f54bf6e.
//
// Solidity: function isOwner(address account) view returns(bool)
func (_Contracts *ContractsCaller) IsOwner(opts *bind.CallOpts, account common.Address) (bool, error) {
	var out []interface{}
	err := _Contracts.contract.Call(opts, &out, "isOwner", account)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// IsOwner is a free data retrieval call binding the contract method 0x2f54bf6e.
//
// Solidity: function isOwner(address account) view returns(bool)
func (_Contracts *ContractsSession) IsOwner(account common.Address) (bool, error) {
	return _Contracts.Contract.IsOwner(&_Contracts.CallOpts, account)
}

// IsOwner is a free data retrieval call binding the contract method 0x2f54bf6e.
//
// Solidity: function isOwner(address account) view returns(bool)
func (_Contracts *ContractsCallerSession) IsOwner(account common.Address) (bool, error) {
	return _Contracts.Contract.IsOwner(&_Contracts.CallOpts, account)
}

// VerifyDocument is a free data retrieval call binding the contract method 0xd40a2c5d.
//
// Solidity: function verifyDocument(uint256 id, string givenHash) view returns(bool)
func (_Contracts *ContractsCaller) VerifyDocument(opts *bind.CallOpts, id *big.Int, givenHash string) (bool, error) {
	var out []interface{}
	err := _Contracts.contract.Call(opts, &out, "verifyDocument", id, givenHash)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// VerifyDocument is a free data retrieval call binding the contract method 0xd40a2c5d.
//
// Solidity: function verifyDocument(uint256 id, string givenHash) view returns(bool)
func (_Contracts *ContractsSession) VerifyDocument(id *big.Int, givenHash string) (bool, error) {
	return _Contracts.Contract.VerifyDocument(&_Contracts.CallOpts, id, givenHash)
}

// VerifyDocument is a free data retrieval call binding the contract method 0xd40a2c5d.
//
// Solidity: function verifyDocument(uint256 id, string givenHash) view returns(bool)
func (_Contracts *ContractsCallerSession) VerifyDocument(id *big.Int, givenHash string) (bool, error) {
	return _Contracts.Contract.VerifyDocument(&_Contracts.CallOpts, id, givenHash)
}

// AddOwner is a paid mutator transaction binding the contract method 0x7065cb48.
//
// Solidity: function addOwner(address newOwner) returns()
func (_Contracts *ContractsTransactor) AddOwner(opts *bind.TransactOpts, newOwner common.Address) (*types.Transaction, error) {
	return _Contracts.contract.Transact(opts, "addOwner", newOwner)
}

// AddOwner is a paid mutator transaction binding the contract method 0x7065cb48.
//
// Solidity: function addOwner(address newOwner) returns()
func (_Contracts *ContractsSession) AddOwner(newOwner common.Address) (*types.Transaction, error) {
	return _Contracts.Contract.AddOwner(&_Contracts.TransactOpts, newOwner)
}

// AddOwner is a paid mutator transaction binding the contract method 0x7065cb48.
//
// Solidity: function addOwner(address newOwner) returns()
func (_Contracts *ContractsTransactorSession) AddOwner(newOwner common.Address) (*types.Transaction, error) {
	return _Contracts.Contract.AddOwner(&_Contracts.TransactOpts, newOwner)
}

// RegisterDocument is a paid mutator transaction binding the contract method 0x8ae28368.
//
// Solidity: function registerDocument(string filename, string fileHash, string minioId, string tag) returns(uint256 id)
func (_Contracts *ContractsTransactor) RegisterDocument(opts *bind.TransactOpts, filename string, fileHash string, minioId string, tag string) (*types.Transaction, error) {
	return _Contracts.contract.Transact(opts, "registerDocument", filename, fileHash, minioId, tag)
}

// RegisterDocument is a paid mutator transaction binding the contract method 0x8ae28368.
//
// Solidity: function registerDocument(string filename, string fileHash, string minioId, string tag) returns(uint256 id)
func (_Contracts *ContractsSession) RegisterDocument(filename string, fileHash string, minioId string, tag string) (*types.Transaction, error) {
	return _Contracts.Contract.RegisterDocument(&_Contracts.TransactOpts, filename, fileHash, minioId, tag)
}

// RegisterDocument is a paid mutator transaction binding the contract method 0x8ae28368.
//
// Solidity: function registerDocument(string filename, string fileHash, string minioId, string tag) returns(uint256 id)
func (_Contracts *ContractsTransactorSession) RegisterDocument(filename string, fileHash string, minioId string, tag string) (*types.Transaction, error) {
	return _Contracts.Contract.RegisterDocument(&_Contracts.TransactOpts, filename, fileHash, minioId, tag)
}

// ContractsDocumentRegisteredIterator is returned from FilterDocumentRegistered and is used to iterate over the raw logs and unpacked data for DocumentRegistered events raised by the Contracts contract.
type ContractsDocumentRegisteredIterator struct {
	Event *ContractsDocumentRegistered // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *ContractsDocumentRegisteredIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(ContractsDocumentRegistered)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(ContractsDocumentRegistered)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *ContractsDocumentRegisteredIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *ContractsDocumentRegisteredIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// ContractsDocumentRegistered represents a DocumentRegistered event raised by the Contracts contract.
type ContractsDocumentRegistered struct {
	Id        *big.Int
	Uploader  common.Address
	Filename  string
	Hash      string
	MinioId   string
	Tag       string
	Timestamp *big.Int
	Raw       types.Log // Blockchain specific contextual infos
}

// FilterDocumentRegistered is a free log retrieval operation binding the contract event 0x60ad8933fcc9b3c5486b5f528783829c3f50d12a0c3bb730d41f9e5e2a80234e.
//
// Solidity: event DocumentRegistered(uint256 indexed id, address indexed uploader, string filename, string hash, string minioId, string tag, uint256 timestamp)
func (_Contracts *ContractsFilterer) FilterDocumentRegistered(opts *bind.FilterOpts, id []*big.Int, uploader []common.Address) (*ContractsDocumentRegisteredIterator, error) {

	var idRule []interface{}
	for _, idItem := range id {
		idRule = append(idRule, idItem)
	}
	var uploaderRule []interface{}
	for _, uploaderItem := range uploader {
		uploaderRule = append(uploaderRule, uploaderItem)
	}

	logs, sub, err := _Contracts.contract.FilterLogs(opts, "DocumentRegistered", idRule, uploaderRule)
	if err != nil {
		return nil, err
	}
	return &ContractsDocumentRegisteredIterator{contract: _Contracts.contract, event: "DocumentRegistered", logs: logs, sub: sub}, nil
}

// WatchDocumentRegistered is a free log subscription operation binding the contract event 0x60ad8933fcc9b3c5486b5f528783829c3f50d12a0c3bb730d41f9e5e2a80234e.
//
// Solidity: event DocumentRegistered(uint256 indexed id, address indexed uploader, string filename, string hash, string minioId, string tag, uint256 timestamp)
func (_Contracts *ContractsFilterer) WatchDocumentRegistered(opts *bind.WatchOpts, sink chan<- *ContractsDocumentRegistered, id []*big.Int, uploader []common.Address) (event.Subscription, error) {

	var idRule []interface{}
	for _, idItem := range id {
		idRule = append(idRule, idItem)
	}
	var uploaderRule []interface{}
	for _, uploaderItem := range uploader {
		uploaderRule = append(uploaderRule, uploaderItem)
	}

	logs, sub, err := _Contracts.contract.WatchLogs(opts, "DocumentRegistered", idRule, uploaderRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(ContractsDocumentRegistered)
				if err := _Contracts.contract.UnpackLog(event, "DocumentRegistered", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseDocumentRegistered is a log parse operation binding the contract event 0x60ad8933fcc9b3c5486b5f528783829c3f50d12a0c3bb730d41f9e5e2a80234e.
//
// Solidity: event DocumentRegistered(uint256 indexed id, address indexed uploader, string filename, string hash, string minioId, string tag, uint256 timestamp)
func (_Contracts *ContractsFilterer) ParseDocumentRegistered(log types.Log) (*ContractsDocumentRegistered, error) {
	event := new(ContractsDocumentRegistered)
	if err := _Contracts.contract.UnpackLog(event, "DocumentRegistered", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// ContractsOwnerAddedIterator is returned from FilterOwnerAdded and is used to iterate over the raw logs and unpacked data for OwnerAdded events raised by the Contracts contract.
type ContractsOwnerAddedIterator struct {
	Event *ContractsOwnerAdded // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *ContractsOwnerAddedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(ContractsOwnerAdded)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(ContractsOwnerAdded)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *ContractsOwnerAddedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *ContractsOwnerAddedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// ContractsOwnerAdded represents a OwnerAdded event raised by the Contracts contract.
type ContractsOwnerAdded struct {
	NewOwner common.Address
	Raw      types.Log // Blockchain specific contextual infos
}

// FilterOwnerAdded is a free log retrieval operation binding the contract event 0x994a936646fe87ffe4f1e469d3d6aa417d6b855598397f323de5b449f765f0c3.
//
// Solidity: event OwnerAdded(address indexed newOwner)
func (_Contracts *ContractsFilterer) FilterOwnerAdded(opts *bind.FilterOpts, newOwner []common.Address) (*ContractsOwnerAddedIterator, error) {

	var newOwnerRule []interface{}
	for _, newOwnerItem := range newOwner {
		newOwnerRule = append(newOwnerRule, newOwnerItem)
	}

	logs, sub, err := _Contracts.contract.FilterLogs(opts, "OwnerAdded", newOwnerRule)
	if err != nil {
		return nil, err
	}
	return &ContractsOwnerAddedIterator{contract: _Contracts.contract, event: "OwnerAdded", logs: logs, sub: sub}, nil
}

// WatchOwnerAdded is a free log subscription operation binding the contract event 0x994a936646fe87ffe4f1e469d3d6aa417d6b855598397f323de5b449f765f0c3.
//
// Solidity: event OwnerAdded(address indexed newOwner)
func (_Contracts *ContractsFilterer) WatchOwnerAdded(opts *bind.WatchOpts, sink chan<- *ContractsOwnerAdded, newOwner []common.Address) (event.Subscription, error) {

	var newOwnerRule []interface{}
	for _, newOwnerItem := range newOwner {
		newOwnerRule = append(newOwnerRule, newOwnerItem)
	}

	logs, sub, err := _Contracts.contract.WatchLogs(opts, "OwnerAdded", newOwnerRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(ContractsOwnerAdded)
				if err := _Contracts.contract.UnpackLog(event, "OwnerAdded", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseOwnerAdded is a log parse operation binding the contract event 0x994a936646fe87ffe4f1e469d3d6aa417d6b855598397f323de5b449f765f0c3.
//
// Solidity: event OwnerAdded(address indexed newOwner)
func (_Contracts *ContractsFilterer) ParseOwnerAdded(log types.Log) (*ContractsOwnerAdded, error) {
	event := new(ContractsOwnerAdded)
	if err := _Contracts.contract.UnpackLog(event, "OwnerAdded", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}
