package com.fenglin.springboottest.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fenglin.springboottest.entity.Skill;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface SkillMapper extends BaseMapper<Skill> {
}
