class Car{
    constructor(x,y,width,height,control_type,max_speed=3,color="white"){
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;

        this.fast=0;
        this.acceleration=0.2;
        this.max_speed=max_speed;
        this.friction=0.05;
        this.corner=0;
        this.damage=false;

        this.useBrain=control_type=="AI";

        if(control_type!="RainbowCar"){
            this.sensor=new Sensor(this);
            this.brain=new Neural_Network(
                [this.sensor.ray_count,6,4]
            );
        }
        this.control=new Controls(control_type);

        this.image=new Image();
        this.image.src="car.png"

        this.mask=document.createElement("canvas");
        this.mask.width=width;
        this.mask.height=height;

        const maskcontext=this.mask.getContext("2d");
        this.image.onload=()=>{
            maskcontext.fillStyle=color;
            maskcontext.rect(0,0,this.width,this.height);
            maskcontext.fill();

            maskcontext.globalCompositeOperation="destination-atop";
            maskcontext.drawImage(this.image,0,0,this.width,this.height);
        }
    }

    update_img(road_borders,car_traffic){
        if(!this.damage){
            this.#movement();
            this.polygon=this.#create_polygon();
            this.damage=this.#assess_damage(road_borders,car_traffic);
        }
        if(this.sensor){
            this.sensor.update_img(road_borders,car_traffic);
            const offsets=this.sensor.readings.map(
                s=>s==null?0:1-s.offset
            );
            const outputs=Neural_Network.feedForward(offsets,this.brain);

            if(this.useBrain){
                this.control.forward=outputs[0];
                this.control.left=outputs[1];
                this.control.right=outputs[2];
                this.control.reverse=outputs[3];
            }
        }
    }

    #assess_damage(road_borders,car_traffic){
        for(let i=0;i<road_borders.length;i++){
            if(polysIntersect(this.polygon,road_borders[i])){
                return true;
            }
        }
        for(let i=0;i<car_traffic.length;i++){
            if(polysIntersect(this.polygon,car_traffic[i].polygon)){
                return true;
            }
        }
        return false;
    }

    #create_polygon(){
        const points=[];
        const radian=Math.hypot(this.width,this.height)/2;
        const alpha=Math.atan2(this.width,this.height);
        points.push({
            x:this.x-Math.sin(this.corner-alpha)*radian,
            y:this.y-Math.cos(this.corner-alpha)*radian
        });
        points.push({
            x:this.x-Math.sin(this.corner+alpha)*radian,
            y:this.y-Math.cos(this.corner+alpha)*radian
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.corner-alpha)*radian,
            y:this.y-Math.cos(Math.PI+this.corner-alpha)*radian
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.corner+alpha)*radian,
            y:this.y-Math.cos(Math.PI+this.corner+alpha)*radian
        });
        return points;
    }

    #movement(){
        if(this.control.forward){
            this.fast+=this.acceleration;
        }
        if(this.control.reverse){
            this.fast-=this.acceleration;
        }

        if(this.fast>this.max_speed){
            this.fast=this.max_speed;
        }
        if(this.fast<-this.max_speed/2){
            this.fast=-this.max_speed/2;
        }

        if(this.fast>0){
            this.fast-=this.friction;
        }
        if(this.fast<0){
            this.fast+=this.friction;
        }
        if(Math.abs(this.fast)<this.friction){
            this.fast=0;
        }

        if(this.fast!=0){
            const flip=this.fast>0?1:-1;
            if(this.control.left){
                this.corner+=0.03*flip;
            }
            if(this.control.right){
                this.corner-=0.03*flip;
            }
        }

        this.x-=Math.sin(this.corner)*this.fast;
        this.y-=Math.cos(this.corner)*this.fast;
    }

    draw(context,draw_sensor=false){
        if(this.sensor && draw_sensor){
            this.sensor.draw(context);
        }

        context.save();
        context.translate(this.x,this.y);
        context.rotate(-this.corner);
        if(!this.damage){
            context.drawImage(this.mask,
                -this.width/2,
                -this.height/2,
                this.width,
                this.height);
            context.globalCompositeOperation="multiply";
        }
        context.drawImage(this.image,
            -this.width/2,
            -this.height/2,
            this.width,
            this.height);
        context.restore();

    }
}