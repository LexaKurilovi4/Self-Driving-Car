class Road{
    constructor(x,width,lane_count=3){
        this.x=x;
        this.width=width;
        this.lane_count=lane_count;

        this.left=x-width/2;
        this.right=x+width/2;

        const infinit=100000;
        this.top=-infinit;
        this.bottom=infinit;

        const top_left={x:this.left,y:this.top};
        const top_right={x:this.right,y:this.top};
        const bottom_left={x:this.left,y:this.bottom};
        const bottom_right={x:this.right,y:this.bottom};
        this.borders=[
            [top_left,bottom_left],
            [top_right,bottom_right]
        ];
    }

    getLane_Center(laneIndex){
        const laneWidth=this.width/this.lane_count;
        return this.left+laneWidth/2+
            Math.min(laneIndex,this.lane_count-1)*laneWidth;
    }

    draw(context){
        context.lineWidth=5;
        context.strokeStyle="white";

        for(let i=1;i<=this.lane_count-1;i++){
            const x=lerp(
                this.left,
                this.right,
                i/this.lane_count
            );
            
            context.setLineDash([20,20]);
            context.beginPath();
            context.moveTo(x,this.top);
            context.lineTo(x,this.bottom);
            context.stroke();
        }

        context.setLineDash([]);
        this.borders.forEach(border=>{
            context.beginPath();
            context.moveTo(border[0].x,border[0].y);
            context.lineTo(border[1].x,border[1].y);
            context.stroke();
        });
    }
}