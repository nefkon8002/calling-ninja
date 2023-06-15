package mx.calling.ninja.api.dtos;

import mx.calling.ninja.data.model.User;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CreationUserDtoTest {

    @Test
    void testToUser() {
        User user = UserDto.builder().mobile("666666666").firstName("daemon").build().toUser();
        assertNotNull(user.getRole());
        assertTrue(user.getActive());
    }
}
