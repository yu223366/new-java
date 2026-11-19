package com.fenglin.springboottest.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fenglin.springboottest.entity.Pokemon;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PokemonMapper extends BaseMapper<Pokemon> {
}
