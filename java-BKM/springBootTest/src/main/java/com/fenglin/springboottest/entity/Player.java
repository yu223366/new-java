package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("player")
public class Player {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String username;
    private String nickname;
    private Integer coins;
    private Integer starterChosen;
    private Integer banned;
    private String stateJson;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
