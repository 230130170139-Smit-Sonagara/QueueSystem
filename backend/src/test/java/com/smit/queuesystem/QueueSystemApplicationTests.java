package com.smit.queuesystem;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Disabled;
import org.springframework.boot.test.context.SpringBootTest;

@Disabled("Legacy local PostgreSQL schema is not isolated for CI-style context boot tests.")
@SpringBootTest
class QueueSystemApplicationTests {

    @Test
    void contextLoads() {
    }

}
