package com.gitmastery.simulator;

import com.gitmastery.simulator.dto.SimulateRequest;
import com.gitmastery.simulator.dto.SimulateResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/simulate")
@RequiredArgsConstructor
public class SimulatorController {
  private final SimulatorService simulatorService;

  @PostMapping
  public SimulateResponse simulate(@RequestBody SimulateRequest request) {
    String cmd = request == null ? null : request.getCommand();
    return simulatorService.simulate(cmd);
  }
}

