package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("gym")
public class Gym {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Integer localId;
    private String region;
    private String name;
    private String leader;
    private String type;
    private String badge;
    private String city;
    private Integer difficulty;
    private Integer hp;
    private String intro;
    private String teamJson;
    private String move;
}
