function EventTarget() {
    this.handlers = {};
}
EventTarget.prototype = {
    constructor: EventTarget,
    addEvent: function (type, handler) {
        if (typeof this.handlers[type] == 'undefined') {
            this.handlers[type] = [];
        }
        this.handlers[type].push(handler);
    },
    fireEvent: function (event) {
        if (!event.target) {
            event.target = this;
        }
        if (this.handlers[event.type] instanceof Array) {
            var handlers = this.handlers[event.type];
            for (var i = 0; i < handlers.length; i++) {
                handlers[i](event);
            }
        }
    },
    removeEvent: function (type, handler) {
        if (this.handlers[type] instanceof Array) {
            var handlers = this.handlers[type];
            for (var i = 0; i < handlers.length; i++) {
                if (handlers[i] == handler) {
                    break;
                }
            }
            handlers.splice(i, 1);
        }
    }
};

function ArrayList() {
    this.arr = [], this.size = function () {
        return this.arr.length;
    }, this.add = function () {
        if (arguments.length == 1) {
            this.arr.push(arguments[0]);
        } else if (arguments.length >= 2) {
            var deleteItem = this.arr[arguments[0]];
            this.arr.splice(arguments[0], 1, arguments[1], deleteItem)
        }
        return this;
    }, this.get = function (index) {
        return this.arr[index];
    }, this.removeIndex = function (index) {
        this.arr.splice(index, 1);
    }, this.removeObj = function (obj) {
        this.removeIndex(this.indexOf(obj));
    }, this.indexOf = function (obj) {
        for (var i = 0; i < this.arr.length; i++) {
            if (this.arr[i] === obj) {
                return i;
            };
        }
        return -1;
    }, this.isEmpty = function () {
        return this.arr.length == 0;
    }, this.clear = function () {
        this.arr = [];
    }, this.contains = function (obj) {
        return this.indexOf(obj) != -1;
    }
};
var YOWORFIDReader = {
    createNew: function () {
        var yw = {};
        yw.Version = "";
        yw.ReaderID = 1;
        yw.UID = 0;
        yw.RequestActive = 1;
        yw.KeyMode = 0;
        yw.KeyString = "FFFFFFFFFFFF";
        yw.KeyStringMode = 0;
        yw.Repeat = 0;
        yw.BeepOnSuccess = 1;
        yw.BeepOnFail = 0;
        yw.HaltAfterSuccess = 0;
        yw.DesDir = 0;
        yw.DesMode = 0;
        yw.DesKey = "";
        yw.DesKeyMode = 0;
        yw.onResult = function (func) {
            target.addEvent("Result", func);
        };
        var FuncID = 0;
        var ws = null;
        var target = null;
        var SocketOpen = false;
        var bExitFromWait = false;
        var SplitChar = String.fromCharCode(65530);
        var Timer;
        var CList;
        var STimer;
        var WSonOpen = function () {
            SocketOpen = true;
            yw.Ver();
        };
        var WSonMessage = function (evt) {
            var t = evt.data.split(SplitChar);
            var resultData = {
                type: "Result",
                FunctionID: parseInt(t[0]),
                Result: parseInt(t[1]),
                UID: parseInt(t[2]),
                ReaderID: parseInt(t[3]),
                CardNo: t[4],
                strData: t[5],
                ValData: parseInt(t[6])
            };
            if (resultData.FunctionID == 14) {
                if (resultData.Result >= 0) yw.Version = resultData.strData;
            }
            if (resultData.FunctionID == 15) return;
            if (target != null) target.fireEvent(resultData);
        };
        var WSonClose = function () {
            SocketOpen = false;
        };
        var WSonError = function () {};
        var Wait = function (ms) {
            var now = new Date();
            var exitTime = now.getTime() + ms;
            while (true) {
                if (ws.readyState == 1) return true;
                now = new Date();
                if (now.getTime() > exitTime) return false;
            }
        };
        var TickOn = function () {
            yw.Tick();
        };
        var st = function () {
            if (CList.size() > 0) {
                ws.send(CList.get(0));
                CList.removeIndex(0);
            }
        };
        yw.TryConnect = function () {
            try {
                if ("WebSocket" in window) {
                    ws = new WebSocket("ws://127.0.0.1:8009/YOWORFIDReader");
                } else if ("MozWebSocket" in window) {
                    ws = new MozWebSocket("ws://127.0.0.1:8009/YOWORFIDReader");
                } else {
                    return false;
                }
                ws.onopen = WSonOpen;
                ws.onmessage = WSonMessage;
                ws.onclose = WSonClose;
                ws.onerror = WSonError;
                target = new EventTarget();
                Timer = setInterval(TickOn, 20000);
                CList = new ArrayList();
                STimer = setInterval(st, 100);
                return true;
            } catch (ex) {
                return false;
            }
        };
        yw.Disconnect = function () {
            clearInterval(Timer);
            clearInterval(STimer);
            if (ws != null) ws.close();
        };
        var s = function (FuncName, FunctionID, ParamStr) {
            var PrixStr;
            PrixStr = yw.ReaderID + SplitChar + yw.UID + SplitChar + yw.RequestActive + SplitChar + yw.KeyMode + SplitChar + yw.KeyString + SplitChar + yw.KeyStringMode + SplitChar + yw.Repeat + SplitChar + yw.BeepOnSuccess + SplitChar + yw.BeepOnFail + SplitChar + yw.HaltAfterSuccess + SplitChar + yw.DesDir + SplitChar + yw.DesMode + SplitChar + yw.DesKey + SplitChar + yw.DesKeyMode + SplitChar + FunctionID + SplitChar;
            CList.add(FuncName + ":" + PrixStr + ParamStr);
        };
        yw.Connected = function () {
            return SocketOpen;
        };
        yw.RequestTypeACardNo = function (FormatID, OrderID) {
            s("RequestTypeACardNo", 0, FormatID + SplitChar + OrderID);
        };
        yw.RequestTypeBCardNo = function () {
            s("RequestTypeBCardNo", 1, "");
        };
        yw.Request15693CardUID = function () {
            s("Request15693CardUID", 2, "");
        };
        yw.RequestChinaIDCardNo = function () {
            s("RequestChinaIDCardNo", 3, "");
        };
        yw.RequestCardNo = function () {
            s("RequestCardNo", 4, "");
        };
        yw.M1ReadBlock = function (blockIndex, FormatID) {
            s("M1ReadBlock", 5, blockIndex + SplitChar + FormatID);
        };
        yw.M1WriteBlock = function (blockindex, blockdata, FormatID) {
            s("M1WriteBlock", 6, blockindex + SplitChar + blockdata + SplitChar + FormatID);
        };
        yw.M1ReadSector = function (sectorindex, FormatID) {
            s("M1ReadSector", 7, sectorindex + SplitChar + FormatID);
        };
        yw.M1WriteSector = function (blockindex, blockdata, FormatID) {
            s("M1WriteSector", 8, blockindex + SplitChar + blockdata + SplitChar + FormatID);
        };
        yw.M1IntialValue = function (blockIndex, value) {
            s("M1IntialValue", 9, blockIndex + SplitChar + value);
        };
        yw.M1GetValue = function (blockIndex) {
            s("M1GetValue", 10, blockIndex);
        };
        yw.M1IncreaseValue = function (blockIndex, value) {
            s("M1IncreaseValue", 11, blockIndex + SplitChar + value);
        };
        yw.M1DecreaseValue = function (blockIndex, value) {
            s("M1DecreaseValue", 12, blockIndex + SplitChar + value);
        };
        yw.Beep = function (TimeOn, TimeOff, Times) {
            s("Beep", 13, TimeOn + SplitChar + TimeOff + SplitChar + Times);
        };
        yw.Ver = function () {
            s("Ver", 14, "");
        };
        yw.Tick = function () {
            s("Tick", 15, "");
        };
        yw.LED = function (LedIndx, TimeOn, TimeOff, Times, LEDOnIndex) {
            s("LED", 16, LedIndx + SplitChar + TimeOn + SplitChar + TimeOff + SplitChar + Times + SplitChar + LEDOnIndex);
        };
        yw.ACPUReset = function () {
            s("typeacpureset", 17, "");
        };
        yw.CPUCOS = function (value) {
            s("CPUCos", 19, value);
        };
        yw.SAMReset = function (Index) {
            s("SAMReset", 20, Index);
        };
        yw.SAMCOS = function (Index, value) {
            s("SAMCos", 21, Index + SplitChar + value);
        };
        yw.Des = function (Data, DataForamt) {
            s("DES", 22, Data + SplitChar + DataForamt);
        };
        yw.G2_Inventory = function (isEPC) {
            s("G2_Inventory", 23, isEPC)
        };
        yw.G2_Read = function (memType, StartPos, ReadLength, FormatID) {
            s("G2_Read", 24, memType + SplitChar + StartPos + SplitChar + ReadLength + SplitChar + FormatID)
        };
        yw.G2_Write = function (memType, StartPos, DataForamtID, Data) {
            s("G2_Write", 25, memType + SplitChar + StartPos + SplitChar + DataForamtID + SplitChar + Data)
        };
        yw.G2_WriteEPC = function (EPCData) {
            s("G2_WriteEPC", 26, EPCData)
        };
        yw.G2_KillTag = function () {
            s("G2_KillTag", 27, "")
        };
        yw.G2_SetProtected = function (ProtectByte, ProtectMode) {
            s("G2_SetProtected", 28, ProtectByte + SplitChar + ProtectMode)
        };
        yw.G2_Earse = function (memType, StartPos, EarseLength) {
            s("G2_Earse", 29, memType + SplitChar + StartPos + SplitChar + EarseLength)
        };
        yw.G2_SetReadProtected = function () {
            s("G2_SetReadProtected", 30, "")
        };
        yw.G2_SetUnlockReadProtected = function () {
            s("G2_SetUnlockReadProtected", 31, "")
        };
        yw.G2_SetEASAlert = function (EAS) {
            s("G2_SetEASAlert", 32, EAS)
        };
        yw.G2_LockUser = function (UserAddr) {
            s("G2_LockUser", 33, UserAddr)
        };
        yw.SinoPecCard_GetInfo = function () {
            s("SinoPecCard_GetInfo", 34, "");
        };
        yw.SinoPecCard_GetBalance = function (PIN) {
            s("SinoPecCard_GetBalance", 35, PIN);
        };
        yw.SinoPecCard_GetRecord = function (PIN, RecordID) {
            s("SinoPecCard_GetRecord", 36, PIN + SplitChar + RecordID);
        };
        yw.ISO15693ReadBlock = function (StartBlock, BlockNums, DataFormat) {
            s("ISO15693ReadBlock", 37, StartBlock + SplitChar + BlockNums + SplitChar + DataFormat);
        };
        yw.ISO15693WriteBlock = function (Block, Data, DataFormat) {
            s("ISO15693WriteBlock", 38, Block + SplitChar + Data + SplitChar + DataFormat);
        };
        yw.ISO15693LockBlock = function (Block) {
            s("ISO15693LockBlock", 39, Block);
        };
        yw.ISO15693WriteAFI = function (AFI) {
            s("ISO15693WriteAFI", 40, AFI);
        };
        yw.ISO15693LockAFI = function () {
            s("ISO15693LockAFI", 41, "");
        };
        yw.ISO15693WriteDSFID = function (DSFID) {
            s("ISO15693WriteDSFID", 42, DSFID);
        };
        yw.ISO15693LockDSFID = function () {
            s("ISO15693LockDSFID", 43, "");
        };
        yw.ISO15693GetInformation = function () {
            s("ISO15693GetInformation", 44, "");
        };
        yw.DownKey = function (KeyIndex, KeyString) {
            s("DownKey", 45, KeyIndex + SplitChar + KeyString);
        };
        yw.NTAG_Auth = function () {
            s("NTAG_Auth", 46, "");
        };
        yw.NTAG_Read = function (StartBlock, BlockNums, FormatID) {
            s("NTAG_Read", 47, StartBlock + SplitChar + BlockNums + SplitChar + FormatID);
        };
        yw.NTAG_Write = function (StartBlock, BlockNums, Data, FormatID) {
            s("NTAG_Write", 48, StartBlock + SplitChar + BlockNums + SplitChar + Data + SplitChar + FormatID);
        };
        yw.NTAG_Counter = function () {
            s("NTAG_Counter", 49, "");
        };
        yw.NTAG_Sign = function () {
            s("NDEF_AddRecord", 50, "");
        };
        yw.NDEF_AddRecord = function (Uri, Payload) {
            s("NDEF_AddRecord", 51, Uri + SplitChar + Payload);
        };
        yw.NDEF_ClearAllRecords = function () {
            s("NDEF_ClearAllRecords", 52, "");
        };
        yw.NDEF_Write = function () {
            s("NDEF_Write", 53, "");
        };
        yw.NDEF_Read = function () {
            s("NDEF_Read", 54, "");
        };
        return yw;
    }
};