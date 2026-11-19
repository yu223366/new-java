package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("skill_base")
public class Skill {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String type;
    private String category;
    private Integer power;
    private Integer accuracy;
    private Integer pp;
    private String effect;
}
