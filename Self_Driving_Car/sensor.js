class Sensor{
    constructor(car){
        this.car=car;
        this.ray_count=5;
        this.ray_length=150;
        this.ray_spread=Math.PI/2;

        this.ray=[];
        this.readings=[];
    }

    update_img(road_borders,car_traffic){
        this.#castRays();
        this.readings=[];
        for(let i=0;i<this.ray.length;i++){
            this.readings.push(
                this.#getReading(
                    this.ray[i],
                    road_borders,
                    car_traffic
                )
            );
        }
    }

    #getReading(ray,road_borders,car_traffic){
        let touches=[];

        for(let i=0;i<road_borders.length;i++){
            const touch=getIntersection(
                ray[0],
                ray[1],
                road_borders[i][0],
                road_borders[i][1]
            );
            if(touch){
                touches.push(touch);
            }
        }

        for(let i=0;i<car_traffic.length;i++){
            const poly=car_traffic[i].polygon;
            for(let j=0;j<poly.length;j++){
                const value=getIntersection(
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j+1)%poly.length]
                );
                if(value){
                    touches.push(value);
                }
            }
        }

        if(touches.length==0){
            return null;
        }else{
            const offsets=touches.map(e=>e.offset);
            const minOffset=Math.min(...offsets);
            return touches.find(e=>e.offset==minOffset);
        }
    }

    #castRays(){
        this.ray=[];
        for(let i=0;i<this.ray_count;i++){
            const raycorner=lerp(
                this.ray_spread/2,
                -this.ray_spread/2,
                this.ray_count==1?0.5:i/(this.ray_count-1)
            )+this.car.corner;

            const start={x:this.car.x, y:this.car.y};
            const end={
                x:this.car.x-
                    Math.sin(raycorner)*this.ray_length,
                y:this.car.y-
                    Math.cos(raycorner)*this.ray_length
            };
            this.ray.push([start,end]);
        }
    }

    draw(context){
        for(let i=0;i<this.ray_count;i++){
            let end=this.ray[i][1];
            if(this.readings[i]){
                end=this.readings[i];
            }

            context.beginPath();
            context.lineWidth=2;
            context.strokeStyle="yellow";
            context.moveTo(
                this.ray[i][0].x,
                this.ray[i][0].y
            );
            context.lineTo(
                end.x,
                end.y
            );
            context.stroke();

            context.beginPath();
            context.lineWidth=2;
            context.strokeStyle="black";
            context.moveTo(
                this.ray[i][1].x,
                this.ray[i][1].y
            );
            context.lineTo(
                end.x,
                end.y
            );
            context.stroke();
        }
    }        
}