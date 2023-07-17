package mx.calling.ninja.data.daos;

import mx.calling.ninja.TestConfig;
import mx.calling.ninja.data.model.Role;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Arrays;
import static mx.calling.ninja.data.model.Role.*;
import static org.junit.jupiter.api.Assertions.assertTrue;

@TestConfig
class UserRepositoryIT {

    @Autowired
    private UserRepository userRepository;

    @Test
    void testFindByMobile() {
        assertTrue(this.userRepository.findByMobile("6").isPresent());
    }

    @Test
    void testFindByRoleIn() {
        List< Role > roles = Arrays.asList(ADMIN, MANAGER);
        assertTrue(this.userRepository.findByRoleIn(roles).stream().allMatch(user -> roles.contains(user.getRole())));
    }

    @Test
    void testFindByMobileAndFirstNameAndFamilyNameAndEmailAndDniNullSafeWithMobile() {
        assertTrue(this.userRepository.findByMobileAndFirstNameAndFamilyNameAndEmailAndDniContainingNullSafe(
                "1", null, null, ".com", null, null, null, Arrays.asList(MANAGER)).stream()
                .anyMatch(user -> "666666001".equals(user.getMobile()))
        );
    }

    @Test
    void testFindByMobileAndFirstNameAndFamilyNameAndEmailAndDniNullSafeWithDni() {
        assertTrue(this.userRepository.findByMobileAndFirstNameAndFamilyNameAndEmailAndDniContainingNullSafe(
                null, null, null, null, null, null, "kk",
                Arrays.asList(ADMIN, MANAGER, OPERATOR, CUSTOMER)).isEmpty()
        );
    }

}
