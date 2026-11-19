package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 宝可梦图鉴实体（动漫原著设定）
 * category=第一属性, category2=第二属性(双属性), level=稀有度等级
 * number=全国图鉴编号, height/weight=身高体重, classification=分类
 */
@Data
@TableName("t_pokemon")
public class Pokemon {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String number;
    private String name;
    private String nameEn;
    private String category;
    private String category2;
    private String level;
    private String classification;
    private String height;
    private String weight;
    private String description;
    private String image;
    private String detailJson;
    private LocalDateTime createTime;
}
