
var canv,ctx,size,canvOffX,canvOffY,sx,sy,turn,isEnd=false,winExodus;
var matrix,ngres;
var HARD_LEVEL=0;
var WIN_LINE_WIDTH=0;
var turn_begin=-1;

var cross_win=0,zero_win=0,game_count=0;

const 
CX=3;
CY=3;
CROSS_LINE_WIDTH = 10;
ZERO_LINE_WIDTH = 10;
FIELD_LINE_WIDTH = 10;
NUMBER_MAX_VALUE=1000000;
NUMBER_MIN_VALUE=-NUMBER_MAX_VALUE;
COMP_TURN=-1;

HARD_LEVEL_MAX = 3;
PLAYER_VS_PLAYER=-1;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

//Возврощает Исход,Положение 
//Исход (+ победа крестиков - победа ноликов):
//0,0	ничья 
//0,-1 игра неокончена 
//1 победа по вертикали
//2 победа по горизонтали
//3 победа по диогонали
function win(){

	for (i=0;i<CX;i++)
	{	
		var column=matrix[i];
		var winner=column[0];
		for (j=1;j<CY;j++)
		if (column[j]!=winner)
		{
			winner=0;
			break; 
		}
		if (winner!=0) return [winner,i];
	}

	for (i=0;i<CY;i++)
	{
		var winner=matrix[0][i];
		for (j=1;j<CX;j++)
		if (matrix[j][i]!=winner)
		{
			winner=0;
			break; 
		}
		if (winner!=0) return [winner*2,i];
	}
	
	
	if (CX==CY)
	{
		var winner=matrix[0][0];
		for (i=0;i<CX;i++)
		if (matrix[i][i]!=winner)
		{
			winner=0;
			break; 
		}
		if (winner!=0) return [winner*3,0];
		
		winner=matrix[CX-1][0]
		for (i=0;i<CX;i++)
		if (matrix[CX-1-i][i]!=winner)
		{
			winner=0;
			break; 
		}
	if (winner!=0) return [winner*3,1];
}
	for (i=0;i<CY;i++)
		for (j=0;j<CX;j++)
			if (matrix[j][i]==0)
			return [0,-1];	
	return [0,0];
}


function GetWinLine(winType,winPlace)
{	
	var wt=Math.abs(winType);
		if (wt==1 )
			return [sx*winPlace+sx/2,sy/4,sx*winPlace+sx/2,size-sy/4];
		if (wt==2 )
			return [sx/4,sy*winPlace+sy/2,size-sx/4,sy*winPlace+sy/2];
		
		if (wt==3 ){
			if (winPlace==0)
				return [sx/4,sy/4,size-sx/4,size-sy/4];
			if (winPlace==1)
				return [size-sx/4,sy/4,sx/4,size-sy/4];
		}
	alert("internal error");
}
function DrawWinLine(x1,y1,x2,y2)
{
	ctx.lineWidth = WIN_LINE_WIDTH;
	ctx.strokeStyle = '#ff8000';
	ctx.beginPath();
	ctx.moveTo(canvOffX+x1,canvOffY+y1);
	ctx.lineTo(canvOffX+x2,canvOffY+y2);
	ctx.stroke();	
	ctx.closePath();	
}

function ResetGame()
{

	for (var i=0;i<CX;i++)
		for (var j=0;j<CY;j++)
			matrix[i][j]=0;
	isEnd=false;
	
	turn=1;
	turn_begin=-turn_begin;
}
function ResetAllGame()
{
	cross_win=0;
	zero_win=0;
	game_count=0;
	ResetGame();
	Draw();
}

function Negamax (matrix,color,deph)
{
	var iswin = win();
	var winType=iswin[0];
	var winPlace=iswin[1];

	if (winPlace!=-1)
	{
		if (winType==0) return 0;  
		if (winType==color) return  NUMBER_MAX_VALUE - deph;
		return deph - NUMBER_MAX_VALUE;	
	}
		
	var max = NUMBER_MIN_VALUE;
    var maxi = -1;
    var maxj = -1;
	
	for (var i=0;i<CX;i++)
	{
		for (var j=0;j<CY;j++)
		{
			if	(matrix[i][j] == 0)
			{
				matrix[i][j] = color;
				var m = -Negamax(matrix, -color, deph + 1);
				matrix[i][j] = 0;											
				if (m > max)
				{
					max = m;
					maxi = i;
					maxj = j;
					if (deph == 0)
						ngres = new Array(0);
				}
				if (deph == 0 && m == max)
				{
					var pt=new Array(2);
					pt[0]=i;
					pt[1]=j;
					ngres.push(pt); 							
				}
			}	
		}
	}
	return max;
 }


function MakeRandomMove(color)
{
	var freeCellCount=0;

	for (var i=0;i<CX;i++)
		for (var j=0;j<CY;j++)
			if	(matrix[i][j]==0) freeCellCount++;
		
	if (freeCellCount==0) 
		return;
	
	var selctedInd=getRandomInt(0,freeCellCount);
	var curInd=0;
	
	for (var i=0;i<CX;i++)
		for (var j=0;j<CY;j++)
			if	(matrix[i][j]==0)
			{
				if (curInd==selctedInd) 
				{
					matrix[i][j]=color;
					return;
				}
				curInd++;
			}		
}

function MakeComputerMove(color)
{
	ngres=new Array(0);
	Negamax(matrix,color,0);
	if (ngres.length>0)
	{
		var ind=Math.floor(Math.random() * ngres.length);
		matrix[ngres[ind][0]][ngres[ind][1]]=color;
	}	
}

function MakeMoveWithHardLevel(color)
{
	var	chance=1/HARD_LEVEL_MAX*HARD_LEVEL;		
	if	(Math.random()>chance) 
	MakeRandomMove(color); 
	else
	MakeComputerMove(color);
}

function DrawLegend()
{
	var txt=cross_win+":"+zero_win+":"+game_count;
	ctx.font = "16px Comic Sans MS";
	ctx.fillStyle = "black";
	ctx.textAlign = "center";
	ctx.fillText(txt,canv.width-( canvOffX+16), canv.height);
	
	var a=turn;
	if (isEnd)
		a=-turn_begin;
	
	var txt2='�';
	if (a==-1) txt2='�';
	ctx.fillText(txt2,canvOffX+16, canv.height);
}

function UpdateWinExodus()
{
	winExodus=win();
	isEnd=winExodus[0]!=0 || winExodus[1]!=-1;

	if (isEnd){
		game_count++;
		if (winExodus[0]>0) cross_win++;
		else 
		if (winExodus[0]<0) zero_win++ ; 
	}
	
}
  
function onClick(e) 
{
	if (isEnd) {
		ResetGame();
		if (HARD_LEVEL!=-1)
		{	
	if (turn_begin==COMP_TURN )
		{
			MakeMoveWithHardLevel(COMP_TURN);
			Draw();
			return;			
		}
		} else
		{
		turn=turn_begin;	
		}
		
		} 
	
    var offsetX = 0, offsetY = 0
	var element=canv;
	if (element.offsetParent) {
		do {
			offsetX += element.offsetLeft;
			offsetY += element.offsetTop;
		} while ((element = element.offsetParent));
    }
	var	x = Math.trunc(CX/size*(e.pageX - offsetX-canvOffX));
	var	y = Math.trunc(CY/size*(e.pageY - offsetY-canvOffY));
	
	if (matrix[x][y]==0) 
	{
		matrix[x][y]=turn;
		var old=turn;
		turn=-turn;
		UpdateWinExodus();
		if (!isEnd && HARD_LEVEL!=-1)
		{
			MakeMoveWithHardLevel(turn);
			turn=-turn;
			UpdateWinExodus();	
		} 
		Draw();
	}
}



function Draw()
{
	ctx.clearRect(0, 0,canv.width,canv.height);
	DrawField(0,0,size,size);
	for (i=0;i<CX;i++)
	{	
		var column=matrix[i];
		for (j=0;j<CY;j++)
		{
			if (column[j]==1)  
			DrawCross(i*sx+CROSS_LINE_WIDTH*2,j*sy+CROSS_LINE_WIDTH*2,sx-CROSS_LINE_WIDTH*4,sy-CROSS_LINE_WIDTH*4);
			else
			if (column[j]==-1) 
			DrawZero(i*sx+ZERO_LINE_WIDTH*2,j*sy+ZERO_LINE_WIDTH*2,sx-ZERO_LINE_WIDTH*4,sy-ZERO_LINE_WIDTH*4);
		}
	}
	if (isEnd && winExodus[0]!=0)
	{
		var coords=GetWinLine(winExodus[0],winExodus[1]);
		DrawWinLine(coords[0],coords[1],coords[2],coords[3]);	
	}
			DrawLegend();
}

function DrawField(x,y,w,h)
{
	ctx.lineWidth = FIELD_LINE_WIDTH;
	ctx.strokeStyle = '#000000';
	var cellw=w/CX;
	var cellh=h/CY;

	ctx.beginPath();
	for (i=1;i<CX;i++)
	{
		ctx.moveTo(canvOffX+x+ cellw*i,canvOffY+y);
		ctx.lineTo(canvOffX+x+cellw*i,canvOffY+y+size);
	}
	for (i=1;i<CY;i++)
	{
	ctx.moveTo(canvOffX+x,canvOffY+y+cellh*i);
	ctx.lineTo(canvOffX+x+size,canvOffY+y+cellh*i);
	}
	ctx.stroke();	
	ctx.closePath();
}


function DrawCross(x,y,w,h)
{
	ctx.lineWidth = CROSS_LINE_WIDTH;
	ctx.strokeStyle = '#0000ff';
	ctx.beginPath();
	ctx.moveTo(canvOffX+x,canvOffY+y);
	ctx.lineTo(canvOffX+x+w,canvOffY+y+h);
	ctx.moveTo(canvOffX+x+w,canvOffY+y);
	ctx.lineTo(canvOffX+x,canvOffY+y+h);
	ctx.stroke();
	ctx.closePath();
}

function PolarDraw(alpha,r1,r2,offsetX,offsetY){
ctx.moveTo(offsetX,offsetY);
ctx.lineTo(offsetX+Math.cos(alpha)*r1,offsetY+Math.sin(alpha)*r2);

}


function DrawZero(x,y,w,h){
	ctx.lineWidth = ZERO_LINE_WIDTH;
	w/=2;h/=2;
	var offx=canvOffX+x+w;
	var offy=canvOffY+y+h;
	ctx.beginPath();
	ctx.ellipse(offx,offy,w,h,0,0,2*Math.PI);
	ctx.strokeStyle = '#ff0000';
	ctx.stroke();	
	ctx.closePath();
}



function UpdateCanvas(){
	
	var w=canv.clientWidth;
	var h=canv.clientHeight;
	canv.width=w;
	canv.height=h;

	canvOffX=0;
	canvOffY=0;
	
	if (w>h){  size=h;canvOffX=(w-h)/2;} else {size=w;canvOffY=(h-w)/2;}
	sx=size/CX;
	sy=size/CY;
	
	WIN_LINE_WIDTH=FIELD_LINE_WIDTH*2;
	
}

function Min(a,b){
	if (a>b) return b;
	return a;
}

window.onload = function() {
	
		
	var path=window.location.href;
	var levelStr="";
	var i=-1;
	for (i=path.length-1;i>=0;i--){
		if (path[i]=="?"){i++; break;}
	}
	if (i>-1)
	{
		while(i<path.length)
		{
			levelStr+=path[i];
			i++;
		}
	HARD_LEVEL=parseInt(levelStr);
	} 
	
	matrix=new Array(CX);
	ngres=new Array(0);
	for (i=0;i<CX;i++)
	{
		mat=new Array(CY);
		for (j=0;j<CY;j++)
		mat[j]=0;
		matrix[i]=mat;	
	}
    canv = document.getElementById("canva");
	ctx = canv.getContext("2d");
	canv.addEventListener("click", onClick, false);
	UpdateCanvas();	
	ResetGame();
	
	if (turn_begin==COMP_TURN && HARD_LEVEL!=-1) MakeMoveWithHardLevel(COMP_TURN);		
	Draw();
};

window.onresize = function() {

UpdateCanvas();
Draw();

};