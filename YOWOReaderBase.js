try
{
var rfidreader=YOWORFIDReader.createNew();
}
catch(e)
{
	alert("创建友我科技RFID云服务连接失败，请先下载安装！");
	top.location = "http://www.youwokeji.com.cn/CloudReader/YOWORFIDReaderCloudForWeb.exe"; 
}

if(!rfidreader.TryConnect())
{
	alert("浏览器不支持，请更换浏览器后重试！");
}



window.onunload=function()
{
	rfidreader.Disconnect();
}

function CheckConnected()
{
	if(!rfidreader.Connected())
	{
		alert("连接RFID读写器云服务失败，重新下载安装！");
		return false;
	}
	return true;	
}

function GetErrStr(ErrCode)
{
	var ErrText="未知错误";
	switch(ErrCode)	
	{
	 case -1:ErrText="没有找到IC卡读卡器，支持型号：YW-605HA或者YW-607";break;
	 case -3:ErrText="寻卡失败";break;
	 case -4:ErrText="寻卡失败";break;
	 case -5:ErrText="卡休眠失败";break;	
	 case -6:ErrText="密钥认证失败";break;
	 case -7:ErrText="读块失败";break;
	 case -8:ErrText="写块失败";break;
	 case -9:ErrText="钱包初始化失败";break;
	 case -10:ErrText="钱包读余额失败";break;
	 case -11:ErrText="钱包充值失败";break;
	 case -12:ErrText="钱包减值失败";break;
	 case -13:ErrText="复位错误";break;
	 case -14:ErrText="COS执行错误";break;
	 case -101:ErrText="参数错误";break;
	case -102:ErrText="DES校验错误";break;
	case -103:ErrText="读卡器不支持";break;
	case -600:ErrText="没找到YW-602系列UHF读卡器";break;
	case -601:ErrText="寻G2标签失败";break;
	case -602:ErrText="读G2标签失败";break;
	case -603:ErrText="写G2标签失败";break;
	case -604:ErrText="执行失败";break;
	}
	return ErrText;
}