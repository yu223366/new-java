package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;

@Data
@TableName("item")
public class Item {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String category;
    private Integer price;
    private BigDecimal mult;
    private String cond;
    private Integer sure;
    private String effect;
    private Integer enabled;
    private Integer sort;
}
